import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db } from './db'
import { authMiddleware } from './auth'

const app = new Hono()

// Require auth for all wali routes
app.use('/*', authMiddleware)

// Helper to check if user is Wali Kelas
const isWali = (c: any) => c.get('user').role === 'wali_kelas'

// --- Endpoints ---
app.get('/siswa', (c) => {
    if (!isWali(c)) return c.json({ error: 'Akses ditolak' }, 403)
    const user = c.get('user')

    const siswa = db.query("SELECT id, name, username, kelas, verified FROM users WHERE role = 'siswa' AND kelas = $kelas").all({ $kelas: user.kelas })
    return c.json({ siswa })
})

app.get('/siswa/pending', (c) => {
    if (!isWali(c)) return c.json({ error: 'Akses ditolak' }, 403)
    const user = c.get('user')

    const siswa = db.query("SELECT id, name, username, kelas, verified FROM users WHERE role = 'siswa' AND kelas = $kelas AND verified = 0").all({ $kelas: user.kelas })
    return c.json({ siswa })
})

app.put('/siswa/:id/verify', zValidator('json', z.object({ action: z.enum(['approve', 'reject']), reason: z.string().optional() })), (c) => {
    if (!isWali(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const user = c.get('user')
    const siswaId = parseInt(c.req.param('id'))
    const { action, reason } = c.req.valid('json')

    // Verify that the siswa belongs to this wali's class
    const target = db.query("SELECT id, kelas FROM users WHERE id = $id AND role = 'siswa'").get({ $id: siswaId }) as { id: number, kelas: string } | undefined
    if (!target || target.kelas !== user.kelas) {
        return c.json({ error: 'Siswa tidak ditemukan atau bukan dari kelas Anda' }, 404)
    }

    const newStatus = action === 'approve' ? 1 : 2

    db.run("UPDATE users SET verified = $status, rejected_reason = $reason WHERE id = $id", {
        $status: newStatus,
        $reason: action === 'reject' ? (reason || null) : null,
        $id: siswaId
    })

    return c.json({ message: action === 'approve' ? 'Verifikasi sukses' : 'Siswa ditolak' })
})

app.get('/rekap', (c) => {
    if (!isWali(c)) return c.json({ error: 'Akses ditolak' }, 403)
    const user = c.get('user')

    // Get all verified siswa in this class
    const siswaList = db.query("SELECT id, name, username, kelas FROM users WHERE role = 'siswa' AND kelas = $kelas AND verified = 1").all({ $kelas: user.kelas }) as any[]

    // For each siswa, aggregate their amaliah
    const rekap = siswaList.map(s => {
        // Get all days
        const records = db.query("SELECT * FROM amaliah WHERE user_id = $id").all({ $id: s.id }) as any[]
        let totalPages = 0
        let hariTercatat = records.length

        for (const r of records) {
            totalPages += r.pages || 0
            // Could parse checks and calculate points here if needed, 
            // but frontend currently only needs hari_tercatat and total_pages
        }

        return {
            id: s.id,
            name: s.name,
            username: s.username,
            kelas: s.kelas,
            hari_tercatat: hariTercatat,
            total_pages: totalPages
        }
    })

    return c.json({ rekap })
})

// Get student verification status per day
app.get('/siswa/:id/verification', (c) => {
    if (!isWali(c)) return c.json({ error: 'Akses ditolak' }, 403)
    
    const user = c.get('user')
    const siswaId = parseInt(c.req.param('id'))
    const day = c.req.query('day') ? parseInt(c.req.query('day')) : null
    
    // Verify that the siswa belongs to this wali's class
    const siswa = db.query("SELECT id, name, username, kelas FROM users WHERE id = $id AND role = 'siswa' AND kelas = $kelas").get({ $id: siswaId, $kelas: user.kelas }) as { id: number, name: string, username: string, kelas: string } | undefined
    if (!siswa) {
        return c.json({ error: 'Siswa tidak ditemukan atau bukan dari kelas Anda' }, 404)
    }
    
    // Get amaliah records
    let query = "SELECT * FROM amaliah WHERE user_id = $user_id"
    const params: any = { $user_id: siswaId }
    
    if (day) {
        query += " AND day = $day"
        params.$day = day
    }
    
    query += " ORDER BY day"
    
    const records = db.query(query).all(params) as any[]
    
    const verificationData = records.map(r => ({
        day: r.day,
        checks: JSON.parse(r.checks || '{}'),
        pages: r.pages,
        catatan: r.catatan,
        parent_verified: r.parent_verified,
        parent_name: r.parent_name,
        parent_verified_at: r.parent_verified_at,
        verification_status: r.parent_verified === 1 ? 'verified' : 'pending'
    }))
    
    return c.json({
        siswa: {
            id: siswa.id,
            name: siswa.name,
            username: siswa.username,
            kelas: siswa.kelas
        },
        verification: verificationData
    })
})

// Get all students verification summary for a specific day
app.get('/verification-summary', (c) => {
    if (!isWali(c)) return c.json({ error: 'Akses ditolak' }, 403)
    
    const user = c.get('user')
    const day = c.req.query('day') ? parseInt(c.req.query('day')) : null
    
    // Get all verified siswa in this class
    const siswaList = db.query("SELECT id, name, username, kelas FROM users WHERE role = 'siswa' AND kelas = $kelas AND verified = 1").all({ $kelas: user.kelas }) as any[]
    
    const summary = siswaList.map(s => {
        let query = "SELECT * FROM amaliah WHERE user_id = $user_id"
        const params: any = { $user_id: s.id }
        
        if (day) {
            query += " AND day = $day"
            params.$day = day
        }
        
        const record = db.query(query).get(params) as any
        
        return {
            id: s.id,
            name: s.name,
            username: s.username,
            kelas: s.kelas,
            day: day || (record?.day || null),
            has_data: !!record,
            parent_verified: record?.parent_verified || 0,
            parent_name: record?.parent_name,
            parent_signature: record?.parent_signature,
            parent_verified_at: record?.parent_verified_at,
            pages: record?.pages || 0,
            verification_status: record?.parent_verified === 1 ? 'verified' : (record ? 'pending' : 'no_data')
        }
    })
    
    // Sort by verification status (verified first, then pending, then no_data)
    summary.sort((a, b) => {
        const statusOrder = { verified: 0, pending: 1, no_data: 2 }
        return statusOrder[a.verification_status] - statusOrder[b.verification_status]
    })
    
    return c.json({ summary })
})

// Reset student verification for a specific day
app.post('/siswa/:id/reset-verification', zValidator('json', z.object({ day: z.number().int().min(1).max(30) })), (c) => {
    if (!isWali(c)) return c.json({ error: 'Akses ditolak' }, 403)

    const user = c.get('user')
    const siswaId = parseInt(c.req.param('id'))
    const { day } = c.req.valid('json')

    // Verify that the siswa belongs to this wali's class
    const siswa = db.query("SELECT id, name, kelas FROM users WHERE id = $id AND role = 'siswa' AND kelas = $kelas").get({ $id: siswaId, $kelas: user.kelas }) as { id: number, name: string, kelas: string } | undefined
    
    if (!siswa) {
        return c.json({ error: 'Siswa tidak ditemukan atau bukan dari kelas Anda' }, 404)
    }

    try {
        // Delete the amaliah record for this day
        db.run("DELETE FROM amaliah WHERE user_id = $user_id AND day = $day", {
            $user_id: siswaId,
            $day: day
        })

        return c.json({ 
            message: `Verifikasi siswa ${siswa.name} untuk hari ke-${day} berhasil direset. Siswa dapat mengisi ulang.`,
            siswa: siswa.name,
            day: day
        })
    } catch (err: any) {
        return c.json({ error: 'Gagal mereset verifikasi: ' + err.message }, 500)
    }
})

export default app
