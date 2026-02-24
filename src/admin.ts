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
