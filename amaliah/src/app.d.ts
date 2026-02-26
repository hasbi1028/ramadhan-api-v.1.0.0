// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				id: number;
				name: string;
				username: string;
				role: 'admin' | 'wali_kelas' | 'siswa';
				kelas: string | null;
				verified: number;
				rejectedReason: string | null;
				mustChangePassword: number;
			} | null;
		}
	}
}

export {};
