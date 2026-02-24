import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db } from './db'
import { authMiddleware } from './auth'

const app = new Hono()

// Require auth for all amaliah routes
app.use('/*', authMiddleware)

// --- Schemas ---
const amaliahSchema = z.object({
    checks: z.any().optional().default({}),
    pages: z.number().int().min(0).optional().default(0),
    catatan: z.string().optional().default(''),
    parent_verified: z.number().optional().default(0),
    parent_name: z.string().optional(),
    parent_signature: z.any().optional(),
})

const parentVerifySchema = z.object({
    parent_name: z.string().min(1, 'Nama orang tua wajib diisi'),
    parent_signature: z.string().optional(),
    use_checkbox: z.boolean().optional().default(false),
})

// --- Endpoints ---
app.get('/', (c) => {
    const user = c.get('user')
    if (user.role !== 'siswa') {
        return c.json({ error: 'Hanya akses siswa' }, 403)
    }

    // Get all days for this user
    const records = db.query("SELECT * FROM amaliah WHERE user_id = $id").all({ $id: user.id }) as any[]

    const data: Record<number, any> = {}
    for (const r of records) {
        data[r.day] = {
            checks: JSON.parse(r.checks || '{}'),
            pages: r.pages,
            catatan: r.catatan,
            parent_verified: r.parent_verified,
            parent_name: r.parent_name,
            parent_signature: r.parent_signature,
            parent_verified_at: r.parent_verified_at
        }
    }

    return c.json({ data })
})

app.put('/:day', zValidator('json', amaliahSchema), (c) => {
    const user = c.get('user')
    const day = parseInt(c.req.param('day'))

    if (user.role !== 'siswa') {
        return c.json({ error: 'Hanya akses siswa' }, 403)
    }

    if (isNaN(day) || day < 1 || day > 30) {
        return c.json({ error: 'Hari tidak valid (1-30)' }, 400)
    }

    const { checks, pages, catatan, parent_verified, parent_name, parent_signature } = c.req.valid('json')

    try {
        // Insert or replace (UPSERT)
        db.run(
            `INSERT INTO amaliah (user_id, day, checks, pages, catatan, parent_verified, parent_name, parent_signature, parent_verified_at)
       VALUES ($user_id, $day, $checks, $pages, $catatan, $parent_verified, $parent_name, $parent_signature, $parent_verified_at)
       ON CONFLICT(user_id, day) DO UPDATE SET
         checks = excluded.checks,
         pages = excluded.pages,
         catatan = excluded.catatan,
         parent_verified = excluded.parent_verified,
         parent_name = excluded.parent_name,
         parent_signature = excluded.parent_signature,
         parent_verified_at = excluded.parent_verified_at`,
            {
                $user_id: user.id,
                $day: day,
                $checks: JSON.stringify(checks),
                $pages: pages,
                $catatan: catatan,
                $parent_verified: parent_verified || 0,
                $parent_name: parent_name || null,
                $parent_signature: parent_signature || null,
                $parent_verified_at: parent_verified === 1 ? new Date().toISOString() : null
            }
        )

        return c.json({ message: `Hari ${day} tersimpan` })
    } catch (err: any) {
        return c.json({ error: 'Gagal menyimpan: ' + err.message }, 500)
    }
})

// Parent verification endpoint
app.post('/:day/verify-parent', zValidator('json', parentVerifySchema), (c) => {
    const user = c.get('user')
    const day = parseInt(c.req.param('day'))

    if (user.role !== 'siswa') {
        return c.json({ error: 'Hanya akses siswa' }, 403)
    }

    if (isNaN(day) || day < 1 || day > 30) {
        return c.json({ error: 'Hari tidak valid (1-30)' }, 400)
    }

    const { parent_name, parent_signature, use_checkbox } = c.req.valid('json')

    try {
        db.run(
            `UPDATE amaliah 
       SET parent_verified = 1, 
           parent_name = $parent_name, 
           parent_signature = $parent_signature,
           parent_verified_at = $parent_verified_at
       WHERE user_id = $user_id AND day = $day`,
            {
                $user_id: user.id,
                $day: day,
                $parent_name: parent_name,
                $parent_signature: use_checkbox ? 'checkbox_confirmed' : (parent_signature || null),
                $parent_verified_at: new Date().toISOString()
            }
        )

        return c.json({ message: `Hari ${day} berhasil diverifikasi oleh orang tua` })
    } catch (err: any) {
        return c.json({ error: 'Gagal verifikasi: ' + err.message }, 500)
    }
})

export default app
