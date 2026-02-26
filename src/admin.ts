import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db } from './db'
import { authMiddleware } from './auth'

const app = new Hono()

// Require auth for all admin routes
app.use('/*', authMiddleware)

// Helper to check if user is Admin
const isAdmin = (c: any) => c.get('user').role === 'admin'

const classSchema = z.object({
    name: z.string().min(1),
})

// --- Endpoints ---
app.get('/stats', (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const total_wali_kelas = db.query("SELECT COUNT(*) as count FROM users WHERE role = 'wali_kelas'").get() as { count: number }
    const total_siswa = db.query("SELECT COUNT(*) as count FROM users WHERE role = 'siswa'").get() as { count: number }
    const pending_wali_kelas = db.query("SELECT COUNT(*) as count FROM users WHERE role = 'wali_kelas' AND verified = 0").get() as { count: number }

    const total_quran_pages = db.query("SELECT SUM(pages) as count FROM amaliah").get() as { count: number | null }

    return c.json({
        stats: {
            total_wali_kelas: total_wali_kelas.count,
            total_siswa: total_siswa.count,
            pending_wali_kelas: pending_wali_kelas.count,
            total_quran_pages: total_quran_pages.count || 0,
        }
    })
})

app.get('/users', zValidator('query', z.object({ role: z.enum(['wali_kelas', 'siswa']) })), (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const { role } = c.req.valid('query')
    const users = db.query("SELECT id, name, username, kelas, verified FROM users WHERE role = $role").all({ $role: role })

    return c.json({ users })
})

app.get('/users/pending', (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    // Frontend specifically checks /admin/users/pending for wali_kelas pending (it has a badge)
    const users = db.query("SELECT id, name, username, kelas, verified FROM users WHERE role = 'wali_kelas' AND verified = 0").all()
    return c.json({ users })
})

app.get('/classes', (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const classes = db
        .query("SELECT id, name, is_active FROM classes WHERE is_active = 1 ORDER BY name ASC")
        .all()

    return c.json({ classes })
})

app.post('/classes', zValidator('json', classSchema), (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const { name } = c.req.valid('json')
    const trimmedName = name.trim()
    if (!trimmedName) return c.json({ error: 'Nama kelas wajib diisi' }, 400)

    const exists = db
        .query("SELECT id FROM classes WHERE LOWER(name) = LOWER($name)")
        .get({ $name: trimmedName }) as { id: number } | undefined
    if (exists) return c.json({ error: 'Kelas sudah ada' }, 400)

    db.run(
        "INSERT INTO classes (name, is_active, created_at, updated_at) VALUES ($name, 1, $created_at, $updated_at)",
        { $name: trimmedName, $created_at: new Date().toISOString(), $updated_at: new Date().toISOString() }
    )

    return c.json({ message: 'Kelas berhasil ditambahkan' }, 201)
})

app.put('/classes/:id', zValidator('json', classSchema), (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const classId = parseInt(c.req.param('id'))
    if (isNaN(classId)) return c.json({ error: 'ID kelas tidak valid' }, 400)

    const { name } = c.req.valid('json')
    const trimmedName = name.trim()
    if (!trimmedName) return c.json({ error: 'Nama kelas wajib diisi' }, 400)

    const currentClass = db.query("SELECT id, name FROM classes WHERE id = $id").get({ $id: classId }) as { id: number, name: string } | undefined
    if (!currentClass) return c.json({ error: 'Kelas tidak ditemukan' }, 404)

    const duplicate = db
        .query("SELECT id FROM classes WHERE LOWER(name) = LOWER($name) AND id != $id")
        .get({ $name: trimmedName, $id: classId }) as { id: number } | undefined
    if (duplicate) return c.json({ error: 'Nama kelas sudah digunakan' }, 400)

    db.run("UPDATE classes SET name = $name, updated_at = $updated_at WHERE id = $id", {
        $name: trimmedName,
        $updated_at: new Date().toISOString(),
        $id: classId,
    })

    if (currentClass.name !== trimmedName) {
        db.run("UPDATE users SET kelas = $newClass WHERE kelas = $oldClass", {
            $newClass: trimmedName,
            $oldClass: currentClass.name,
        })
    }

    return c.json({ message: 'Kelas berhasil diperbarui' })
})

app.delete('/classes/:id', (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const classId = parseInt(c.req.param('id'))
    if (isNaN(classId)) return c.json({ error: 'ID kelas tidak valid' }, 400)

    const classRow = db.query("SELECT id, name FROM classes WHERE id = $id").get({ $id: classId }) as { id: number, name: string } | undefined
    if (!classRow) return c.json({ error: 'Kelas tidak ditemukan' }, 404)

    const usedByUsers = db
        .query("SELECT COUNT(*) as count FROM users WHERE kelas = $kelas")
        .get({ $kelas: classRow.name }) as { count: number }

    if (usedByUsers.count > 0) {
        return c.json({ error: 'Kelas masih digunakan oleh user. Pindahkan user terlebih dahulu.' }, 400)
    }

    db.run("DELETE FROM classes WHERE id = $id", { $id: classId })
    return c.json({ message: 'Kelas berhasil dihapus' })
})

app.put('/users/:id/verify', zValidator('json', z.object({ action: z.enum(['approve', 'reject']), reason: z.string().optional() })), (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const userId = parseInt(c.req.param('id'))
    const { action, reason } = c.req.valid('json')

    // Verify that target is a wali_kelas
    const target = db.query("SELECT id, role FROM users WHERE id = $id AND role = 'wali_kelas'").get({ $id: userId }) as { id: number, role: string } | undefined
    if (!target) {
        return c.json({ error: 'Wali Kelas tidak ditemukan' }, 404)
    }

    const newStatus = action === 'approve' ? 1 : 2

    db.run("UPDATE users SET verified = $status, rejected_reason = $reason WHERE id = $id", {
        $status: newStatus,
        $reason: action === 'reject' ? (reason || null) : null,
        $id: userId
    })

    return c.json({ message: action === 'approve' ? 'Verifikasi sukses' : 'Wali Kelas ditolak' })
})

app.delete('/users/:id', (c) => {
    if (!isAdmin(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const userId = parseInt(c.req.param('id'))

    // Prevent deleting oneself
    if (c.get('user').id === userId) {
        return c.json({ error: 'Tidak dapat menghapus diri sendiri' }, 400)
    }

    const target = db.query("SELECT id FROM users WHERE id = $id").get({ $id: userId }) as any
    if (!target) {
        return c.json({ error: 'User tidak ditemukan' }, 404)
    }

    // Related amaliah records will be cascade deleted
    db.run("DELETE FROM users WHERE id = $id", { $id: userId })

    return c.json({ message: 'User berhasil dihapus' })
})

export default app
