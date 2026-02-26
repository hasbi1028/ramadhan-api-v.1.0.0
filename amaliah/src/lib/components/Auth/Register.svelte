<script lang="ts">
	import { toastStore } from '$lib/stores/toast.store';
	import { apiPost, apiGet } from '$lib/utils/api';
	import Skeleton from '$lib/components/Skeleton.svelte';

	interface ClassOption {
		id: number;
		name: string;
	}

	let name = $state('');
	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let role = $state<'siswa' | 'wali_kelas'>('siswa');
	let selectedClass = $state('');
	let classes = $state<ClassOption[]>([]);
	let loading = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	// Load classes on mount
	$effect(() => {
		apiGet<{ classes: ClassOption[] }>('/api/auth/classes')
			.then((response) => {
				if (response.data) {
					classes = response.data.classes;
				}
			})
			.catch(console.error);
	});

	function handleSubmit() {
		// Validation
		if (!name.trim() || !username.trim() || !password || !confirmPassword) {
			toastStore.error('Semua field wajib diisi');
			return;
		}

		if (password !== confirmPassword) {
			toastStore.error('Password tidak cocok');
			return;
		}

		if (password.length < 6) {
			toastStore.error('Password minimal 6 karakter');
			return;
		}

		if (!selectedClass) {
			toastStore.error('Kelas wajib dipilih');
			return;
		}

		loading = true;

		apiPost('/api/auth/register', {
			name: name.trim(),
			username: username.trim(),
			password,
			role,
			kelas: selectedClass
		})
			.then((response) => {
				if (response.error) {
					toastStore.error(response.error);
					return;
				}

				toastStore.success(response.message || 'Registrasi berhasil. Silakan tunggu verifikasi.');
				// Reset form
				name = '';
				username = '';
				password = '';
				confirmPassword = '';
				selectedClass = '';
			})
			.catch(() => {
				toastStore.error('Terjadi kesalahan. Silakan coba lagi.');
			})
			.finally(() => {
				loading = false;
			});
	}
</script>

<div class="register-container">
	<div class="register-card">
		<div class="register-header">
			<div class="logo">📖</div>
			<h1 class="title">Daftar Akun Baru</h1>
			<p class="subtitle">Buku Amaliah Ramadhan</p>
		</div>

		<form class="register-form" onsubmit={(e) => (e.preventDefault(), handleSubmit())}>
			<div class="form-group">
				<label for="name">Nama Lengkap</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="Masukkan nama lengkap"
					disabled={loading}
					autocomplete="name"
				/>
			</div>

			<div class="form-group">
				<label for="username">Username</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					placeholder="Masukkan username"
					disabled={loading}
					autocomplete="username"
				/>
			</div>

			<div class="form-group">
				<label for="role">Daftar Sebagai</label>
				<select
					id="role"
					bind:value={role}
					disabled={loading}
				>
					<option value="siswa">Siswa</option>
					<option value="wali_kelas">Wali Kelas</option>
				</select>
			</div>

			<div class="form-group">
				<label for="kelas">Kelas</label>
				<select
					id="kelas"
					bind:value={selectedClass}
					disabled={loading}
				>
					<option value="">Pilih Kelas</option>
					{#each classes as cls}
						<option value={cls.name}>{cls.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<div class="password-input">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="Minimal 6 karakter"
						disabled={loading}
						autocomplete="new-password"
					/>
					<button
						type="button"
						class="toggle-password"
						onclick={() => (showPassword = !showPassword)}
						tabindex="-1"
					>
						{showPassword ? '🙈' : '👁️'}
					</button>
				</div>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Konfirmasi Password</label>
				<div class="password-input">
					<input
						id="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						bind:value={confirmPassword}
						placeholder="Ulangi password"
						disabled={loading}
						autocomplete="new-password"
					/>
					<button
						type="button"
						class="toggle-password"
						onclick={() => (showConfirmPassword = !showConfirmPassword)}
						tabindex="-1"
					>
						{showConfirmPassword ? '🙈' : '👁️'}
					</button>
				</div>
			</div>

			<div class="form-actions">
				<button type="submit" class="btn-register" disabled={loading}>
					{#if loading}
						<Skeleton width="100px" height="20px" />
					{:else}
						Daftar
					{/if}
				</button>
			</div>
		</form>

		<div class="register-footer">
			<p>Sudah punya akun?</p>
			<a href="/login" class="btn-login">Masuk</a>
		</div>
	</div>
</div>

<style>
	.register-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(160deg, #0f3d2e 0%, #1a5c45 100%);
		padding: 1rem;
	}

	.register-card {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 2rem;
		width: 100%;
		max-width: 28rem;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	.register-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.logo {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.title {
		font-family: 'Playfair Display', serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: #c9963c;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.register-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.form-group input,
	.form-group select {
		padding: 0.75rem 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 0.875rem;
		transition: border-color 0.2s;
	}

	.form-group select option {
		background: #0f3d2e;
		color: white;
	}

	.form-group input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #c9963c;
	}

	.password-input {
		position: relative;
		display: flex;
		align-items: center;
	}

	.password-input input {
		flex: 1;
		padding-right: 3rem;
	}

	.toggle-password {
		position: absolute;
		right: 0.75rem;
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.toggle-password:hover {
		opacity: 1;
	}

	.form-actions {
		margin-top: 0.5rem;
	}

	.btn-register {
		width: 100%;
		background: linear-gradient(135deg, #c9963c 0%, #f0c14b 100%);
		color: #0f3d2e;
		border: none;
		border-radius: 0.5rem;
		padding: 0.875rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-register:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(201, 150, 60, 0.3);
	}

	.btn-register:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.register-footer {
		margin-top: 1.5rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
	}

	.btn-login {
		display: inline-block;
		margin-top: 0.5rem;
		color: #c9963c;
		font-weight: 600;
		text-decoration: none;
		transition: color 0.2s;
	}

	.btn-login:hover {
		color: #f0c14b;
	}
</style>
