<script lang="ts">
	import { onMount } from 'svelte';
	import { apiPut } from '$lib/utils/api';
	import { toastStore } from '$lib/stores/toast.store';

	interface User {
		id: number;
		name: string;
		username: string;
		role: string;
		kelas?: string;
		verified: number;
		must_change_password?: number;
	}

	interface Props {
		user: User;
		onUserUpdated: (user: User) => void;
	}

	let { user, onUserUpdated }: Props = $props();

	let name = $state('');
	let oldPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let showOldPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	onMount(() => {
		name = user?.name || '';
	});

	async function handleUpdateProfile() {
		if (!name.trim()) {
			toastStore.error('Nama wajib diisi');
			return;
		}

		loading = true;

		try {
			const response = await apiPut<{ user: User }>('/api/auth/profile', { name: name.trim() });

			if (response.error) {
				toastStore.error(response.error);
			} else if (response.data) {
				onUserUpdated(response.data.user as User);
			}
		} catch (error) {
			console.error('[Profile] Update error:', error);
			toastStore.error('Gagal memperbarui profil');
		} finally {
			loading = false;
		}
	}

	async function handleChangePassword() {
		if (!oldPassword || !newPassword || !confirmPassword) {
			toastStore.error('Semua field password wajib diisi');
			return;
		}

		if (newPassword !== confirmPassword) {
			toastStore.error('Password baru tidak cocok');
			return;
		}

		if (newPassword.length < 6) {
			toastStore.error('Password minimal 6 karakter');
			return;
		}

		loading = true;

		try {
			const response = await apiPut('/api/auth/change-password', {
				old_password: oldPassword,
				new_password: newPassword
			});

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success('Password berhasil diubah');
				oldPassword = '';
				newPassword = '';
				confirmPassword = '';
			}
		} catch (error) {
			console.error('[Profile] Password error:', error);
			toastStore.error('Gagal mengubah password');
		} finally {
			loading = false;
		}
	}
</script>

<div class="profile-container">
	<div class="header-section">
		<h2>👤 Profil Saya</h2>
	</div>

	<div class="content-section">
		<!-- User Info Card -->
		<div class="info-card">
			<div class="info-row">
				<span class="info-label">Nama:</span>
				<span class="info-value">{user.name}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Username:</span>
				<span class="info-value">@{user.username}</span>
			</div>
			<div class="info-row">
				<span class="info-label">Role:</span>
				<span class="info-value">
					{#if user.role === 'admin'}
						🔑 Administrator
					{:else if user.role === 'wali_kelas'}
						👩‍🏫 Wali Kelas
					{:else}
						🎓 Siswa
					{/if}
				</span>
			</div>
			{#if user.kelas}
				<div class="info-row">
					<span class="info-label">Kelas:</span>
					<span class="info-value">{user.kelas}</span>
				</div>
			{/if}
			<div class="info-row">
				<span class="info-label">Status:</span>
				<span class="info-value">
					{#if user.verified === 1}
						<span class="badge approved">✅ Aktif</span>
					{:else if user.verified === 2}
						<span class="badge rejected">❌ Ditolak</span>
					{:else}
						<span class="badge pending">⏳ Pending</span>
					{/if}
				</span>
			</div>
		</div>

		<!-- Update Profile Form -->
		<div class="form-section">
			<h3>Perbarui Profil</h3>
			<div class="form-group">
				<label for="name">Nama Lengkap</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="Nama lengkap"
				/>
			</div>
			<button class="btn-update" onclick={handleUpdateProfile} disabled={loading}>
				{#if loading}Menyimpan...{:else}💾 Simpan Perubahan{/if}
			</button>
		</div>

		<!-- Change Password Form -->
		<div class="form-section">
			<h3>Ubah Password</h3>
			<div class="form-group">
				<label for="old_password">Password Lama</label>
				<div class="password-input">
					<input
						id="old_password"
						type={showOldPassword ? 'text' : 'password'}
						bind:value={oldPassword}
						placeholder="Password lama"
					/>
					<button
						type="button"
						class="toggle-password"
						onclick={() => (showOldPassword = !showOldPassword)}
					>
						{showOldPassword ? '🙈' : '👁️'}
					</button>
				</div>
			</div>
			<div class="form-group">
				<label for="new_password">Password Baru</label>
				<div class="password-input">
					<input
						id="new_password"
						type={showNewPassword ? 'text' : 'password'}
						bind:value={newPassword}
						placeholder="Minimal 6 karakter"
					/>
					<button
						type="button"
						class="toggle-password"
						onclick={() => (showNewPassword = !showNewPassword)}
					>
						{showNewPassword ? '🙈' : '👁️'}
					</button>
				</div>
			</div>
			<div class="form-group">
				<label for="confirm_password">Konfirmasi Password Baru</label>
				<div class="password-input">
					<input
						id="confirm_password"
						type={showConfirmPassword ? 'text' : 'password'}
						bind:value={confirmPassword}
						placeholder="Ulangi password baru"
					/>
					<button
						type="button"
						class="toggle-password"
						onclick={() => (showConfirmPassword = !showConfirmPassword)}
					>
						{showConfirmPassword ? '🙈' : '👁️'}
					</button>
				</div>
			</div>
			<button class="btn-change" onclick={handleChangePassword} disabled={loading}>
				{#if loading}Menyimpan...{:else}🔒 Ubah Password{/if}
			</button>
		</div>
	</div>
</div>

<style>
	.profile-container {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1rem;
	}

	.header-section h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #c9963c;
		margin: 0 0 1rem 0;
	}

	.content-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.info-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.info-row:last-child {
		border-bottom: none;
	}

	.info-label {
		color: rgba(255, 255, 255, 0.6);
		font-weight: 600;
	}

	.info-value {
		color: rgba(255, 255, 255, 0.9);
		font-weight: 700;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.badge.approved {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
	}

	.badge.rejected {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.badge.pending {
		background: rgba(234, 179, 8, 0.2);
		color: #eab308;
	}

	.form-section {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.form-section h3 {
		font-size: 1rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 1rem 0;
	}

	.form-group {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.form-group input {
		padding: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 1rem;
	}

	.form-group input::placeholder {
		color: rgba(255, 255, 255, 0.4);
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

	.btn-update,
	.btn-change {
		width: 100%;
		padding: 0.875rem;
		background: linear-gradient(135deg, #c9963c 0%, #f0c14b 100%);
		color: #0f3d2e;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.btn-update:hover:not(:disabled),
	.btn-change:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.btn-update:disabled,
	.btn-change:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
