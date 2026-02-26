<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { toastStore } from '$lib/stores/toast.store';
	import { apiPost } from '$lib/utils/api';
	import Skeleton from '$lib/components/Skeleton.svelte';

	interface User {
		id: number;
		name: string;
		username: string;
		role: 'admin' | 'wali_kelas' | 'siswa';
		kelas?: string;
		verified: number;
	}

	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let showPassword = $state(false);
	let loginError = $state<string | null>(null);

	function handleSubmit(e: Event) {
		e.preventDefault();
		loginError = null;

		if (!username.trim() || !password.trim()) {
			toastStore.error('Username dan password wajib diisi');
			return;
		}

		loading = true;

		apiPost<{ token: string; user: User; message: string }>('/api/auth/login', {
			username: username.trim(),
			password
		})
			.then((response) => {
				if (response.error || !response.data) {
					toastStore.error(response.error || 'Login gagal');
					loginError = response.error || 'Login gagal';
					return;
				}

				const { token, user } = response.data;
				authStore.login(user, token);
				toastStore.success(response.data.message || 'Login berhasil');
			})
			.catch((err) => {
				console.error('[Login] Error:', err);
				toastStore.error('Terjadi kesalahan. Silakan coba lagi.');
				loginError = 'Gagal terhubung ke server';
			})
			.finally(() => {
				loading = false;
			});
	}
</script>

<div class="login-container">
	<div class="login-card">
		<div class="login-header">
			<div class="logo">📖</div>
			<h1 class="title">Buku Amaliah Ramadhan</h1>
			<p class="subtitle">MTS Negeri 2 Kolaka Utara</p>
		</div>

		<form class="login-form" onsubmit={handleSubmit}>
			{#if loginError}
				<div class="error-message">
					⚠️ {loginError}
				</div>
			{/if}

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
				<label for="password">Password</label>
				<div class="password-input">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="Masukkan password"
						disabled={loading}
						autocomplete="current-password"
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

			<button type="submit" class="btn-login" disabled={loading}>
				{#if loading}
					<Skeleton width="80px" height="20px" />
				{:else}
					Masuk
				{/if}
			</button>
		</form>

		<div class="login-footer">
			<p>Belum punya akun?</p>
			<a href="/register" class="btn-register">Daftar</a>
		</div>
	</div>
</div>

<style>
	.login-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(160deg, #0f3d2e 0%, #1a5c45 100%);
		padding: 1rem;
	}

	.login-card {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 1rem;
		padding: 2rem;
		width: 100%;
		max-width: 26rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
	}

	.login-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.logo {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.title {
		font-family: 'Playfair Display', serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #c9963c;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.error-message {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #ef4444;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 1rem;
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

	.form-group input {
		padding: 0.75rem 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.form-group input:focus {
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

	.btn-login {
		background: linear-gradient(135deg, #c9963c 0%, #f0c14b 100%);
		color: #0f3d2e;
		border: none;
		border-radius: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.btn-login:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(201, 150, 60, 0.3);
	}

	.btn-login:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.login-footer {
		margin-top: 1.5rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
	}

	.btn-register {
		display: inline-block;
		margin-top: 0.5rem;
		color: #c9963c;
		font-weight: 600;
		text-decoration: none;
		transition: color 0.2s;
	}

	.btn-register:hover {
		color: #f0c14b;
	}
</style>
