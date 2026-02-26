<script lang="ts">
	import { onMount } from 'svelte';
	import { apiGet, apiPut, apiDelete } from '$lib/utils/api';
	import { toastStore } from '$lib/stores/toast.store';
	import Skeleton from '$lib/components/Skeleton.svelte';

	interface User {
		id: number;
		name: string;
		username: string;
		role: string;
		kelas?: string;
		verified: number;
	}

	interface Props {
		user: User;
		role: 'wali_kelas' | 'siswa';
	}

	let { user, role }: Props = $props();

	let usersList = $state<User[]>([]);
	let loading = $state(true);
	let actionLoading = $state<Record<number, boolean>>({});

	onMount(async () => {
		await loadUsers();
	});

	async function loadUsers() {
		loading = true;
		try {
			const response = await apiGet<{ users: User[] }>(`/api/admin/users?role=${role}`);

			if (response.data) {
				usersList = response.data.users;
			}
		} catch (error) {
			console.error('[UserManagement] Error:', error);
			toastStore.error('Gagal memuat data user');
		} finally {
			loading = false;
		}
	}

	async function handleVerify(userId: number, action: 'approve' | 'reject') {
		actionLoading[userId] = true;

		try {
			const response = await apiPut(`/api/admin/users/${userId}/verify`, {
				action,
				reason: action === 'reject' ? 'Tidak memenuhi syarat' : undefined
			});

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success(response.message || 'Verifikasi berhasil');
				await loadUsers();
			}
		} catch (error) {
			console.error('[UserManagement] Verify error:', error);
			toastStore.error('Gagal memverifikasi user');
		} finally {
			delete actionLoading[userId];
		}
	}

	async function handleDelete(userId: number, userName: string) {
		if (!confirm(`Hapus user ${userName}?`)) {
			return;
		}

		actionLoading[userId] = true;

		try {
			const response = await apiDelete(`/api/admin/users/${userId}`);

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success(response.message || 'User berhasil dihapus');
				await loadUsers();
			}
		} catch (error) {
			console.error('[UserManagement] Delete error:', error);
			toastStore.error('Gagal menghapus user');
		} finally {
			delete actionLoading[userId];
		}
	}
</script>

<div class="usermgmt-container">
	<div class="header-section">
		<h2>👥 Kelola {role === 'wali_kelas' ? 'Wali Kelas' : 'Siswa'}</h2>
	</div>

	{#if loading}
		<div class="loading-state">
			<Skeleton width="100%" height="300px" />
		</div>
	{:else}
		<div class="content-section">
			{#if usersList.length === 0}
				<div class="empty-state">
					<p>Belum ada {role === 'wali_kelas' ? 'wali kelas' : 'siswa'} terdaftar</p>
				</div>
			{:else}
				<div class="users-list">
					{#each usersList as u}
						<div class="user-card">
							<div class="user-info">
								<div class="user-name">{u.name}</div>
								<div class="user-username">@{u.username}</div>
								{#if u.kelas}
									<div class="user-kelas">🏫 {u.kelas}</div>
								{/if}
							</div>
							<div class="user-actions">
								{#if u.verified === 0}
									<div class="verify-actions">
										<button
											class="btn-approve"
											onclick={() => handleVerify(u.id, 'approve')}
											disabled={actionLoading[u.id]}
										>
											✅
										</button>
										<button
											class="btn-reject"
											onclick={() => handleVerify(u.id, 'reject')}
											disabled={actionLoading[u.id]}
										>
											❌
										</button>
									</div>
								{:else}
									<span class="status-badge {u.verified === 1 ? 'approved' : 'rejected'}">
										{u.verified === 1 ? '✅ Aktif' : '❌ Ditolak'}
									</span>
								{/if}
								<button
									class="btn-delete"
									onclick={() => handleDelete(u.id, u.name)}
									disabled={actionLoading[u.id]}
								>
									🗑️
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.usermgmt-container {
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

	.loading-state {
		margin-top: 1rem;
	}

	.content-section {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.75rem;
		padding: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.users-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.user-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.user-info {
		flex: 1;
	}

	.user-name {
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 0.25rem;
	}

	.user-username {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		margin-bottom: 0.25rem;
	}

	.user-kelas {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.user-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.verify-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-approve,
	.btn-reject,
	.btn-delete {
		padding: 0.5rem;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: transform 0.2s;
		font-size: 1rem;
	}

	.btn-approve {
		background: rgba(16, 185, 129, 0.2);
	}

	.btn-reject {
		background: rgba(239, 68, 68, 0.2);
	}

	.btn-delete {
		background: rgba(239, 68, 68, 0.1);
	}

	.btn-approve:hover:not(:disabled),
	.btn-reject:hover:not(:disabled),
	.btn-delete:hover:not(:disabled) {
		transform: scale(1.1);
	}

	.btn-approve:disabled,
	.btn-reject:disabled,
	.btn-delete:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.375rem 0.75rem;
		border-radius: 0.375rem;
	}

	.status-badge.approved {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
	}

	.status-badge.rejected {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}
</style>
