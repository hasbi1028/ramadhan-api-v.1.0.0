import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db } from './db'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_EXPIRY } from './config'

const app = new Hono()

// --- Types ---
type User = {
    id: number;
    name: string;
    username: string;
    password?: string;
    role: 'admin' | 'wali_kelas' | 'siswa';
    kelas: string | null;
    verified: number; // 0, 1, 2
    rejected_reason: string | null;
    must_change_password: number;
}

// --- Schemas ---
const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
})

const registerSchema = z.object({
    name: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(6),
    role: z.enum(['admin', 'wali_kelas', 'siswa']),
    kelas: z.string().optional(),
})

const changePasswordSchema = z.object({
    old_password: z.string().min(1),
    new_password: z.string().min(6),
})

// --- Middleware: Verify Token ---
export const authMiddleware = async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.substring(7)
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: number, username: string, role: string }
        const user = db.query("SELECT * FROM users WHERE id = $id").get({ $id: payload.id }) as User | undefined
        if (!user) return c.json({ error: 'User not found' }, 401)

        // Remove password field from request ctx
        delete user.password
        c.set('user', user)
        await next()
    } catch (err) {
        return c.json({ error: 'Invalid token' }, 401)
    }
}

// --- Endpoints ---
app.post('/login', zValidator('json', loginSchema), async (c) => {
    const { username, password } = c.req.valid('json')

    const user = db.query("SELECT * FROM users WHERE username = $username").get({ $username: username }) as User | undefined
    if (!user) {
        return c.json({ error: 'Username atau password salah' }, 401)
    }

    // Verify password using Bun's native hashing
    const isMatch = await Bun.password.verify(password, user.password!)
    if (!isMatch) {
        return c.json({ error: 'Username atau password salah' }, 401)
    }

    // Create JWT
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY })

    delete user.password
    return c.json({ token, user, message: 'Login berhasil' })
})

app.post('/register', zValidator('json', registerSchema), async (c) => {
    const { name, username, password, role, kelas } = c.req.valid('json')

    // Check if username exists
    const existing = db.query("SELECT id FROM users WHERE username = $username").get({ $username: username })
    if (existing) {
        return c.json({ error: 'Username sudah digunakan' }, 400)
    }

    try {
        const hashedPassword = await Bun.password.hash(password)

        // Admins are usually approved by default, others pending (0) or wait logic
        // Currently logic requests we insert as pending (0) if it's siswa or wali_kelas.
        const verifiedStatus = role === 'admin' ? 1 : 0
        const changePwdStatus = 0

        // Prevent random users from registering as admin
        if (role === 'admin') {
            return c.json({ error: 'Tidak dapat mendaftar sebagai admin' }, 403)
        }

        const result = db.run(
            `INSERT INTO users (name, username, password, role, kelas, verified, must_change_password) 
       VALUES ($name, $username, $password, $role, $kelas, $verified, $must_change_password)`,
            {
                $name: name,
                $username: username,
                $password: hashedPassword,
                $role: role,
                $kelas: kelas || null,
                $verified: verifiedStatus,
                $must_change_password: changePwdStatus
            }
        )

        return c.json({ message: 'Registrasi berhasil. Silakan tunggu verifikasi.', id: result.lastInsertRowid }, 201)
    } catch (err: any) {
        return c.json({ error: 'Database error: ' + err.message }, 500)
    }
})

app.post('/change-password', authMiddleware, zValidator('json', changePasswordSchema), async (c) => {
    const user = c.get('user') as User
    const { old_password, new_password } = c.req.valid('json')

    const userDb = db.query("SELECT password FROM users WHERE id = $id").get({ $id: user.id }) as { password: string }

    const isMatch = await Bun.password.verify(old_password, userDb.password)
    if (!isMatch) {
        return c.json({ error: 'Password lama salah' }, 400)
    }

    const hashedNew = await Bun.password.hash(new_password)

    db.run("UPDATE users SET password = $new_pwd, must_change_password = 0 WHERE id = $id", {
        $new_pwd: hashedNew,
        $id: user.id
    })

    return c.json({ message: 'Password berhasil diubah' })
})

app.get('/me', authMiddleware, (c) => {
    const user = c.get('user')
    return c.json({ user })
})

export default app
