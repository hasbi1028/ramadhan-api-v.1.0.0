<script lang="ts">
	import { onMount } from 'svelte';
	import { apiGet, apiPut } from '$lib/utils/api';
	import { toastStore } from '$lib/stores/toast.store';
	import Skeleton from '$lib/components/Skeleton.svelte';

	interface User {
		id: number;
		name: string;
		username: string;
		role: string;
		kelas?: string;
	}

	interface Siswa {
		id: number;
		name: string;
		username: string;
		kelas: string;
		verified: number;
	}

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let siswaList = $state<Siswa[]>([]);
	let pendingList = $state<Siswa[]>([]);
	let loading = $state(true);
	let actionLoading = $state<Record<number, boolean>>({});

	onMount(async () => {
		await Promise.all([loadSiswa(), loadPending()]);
		loading = false;
	});

	async function loadSiswa() {
		const response = await apiGet<{ siswa: Siswa[] }>('/api/wali/siswa');
		if (response.data) {
			siswaList = response.data.siswa;
		}
	}

	async function loadPending() {
		const response = await apiGet<{ siswa: Siswa[] }>('/api/wali/siswa?pending=true');
		if (response.data) {
			pendingList = response.data.siswa;
		}
	}

	async function handleVerify(siswaId: number, action: 'approve' | 'reject', reason?: string) {
		actionLoading[siswaId] = true;

		try {
			const response = await apiPut(`/api/wali/siswa/${siswaId}/verify`, { action, reason });

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success(response.message || 'Verifikasi berhasil');
				await loadPending();
				await loadSiswa();
			}
		} catch (error) {
			console.error('[Verifikasi] Error:', error);
			toastStore.error('Gagal memverifikasi siswa');
		} finally {
			delete actionLoading[siswaId];
		}
	}

	function getStatusBadge(verified: number) {
		if (verified === 1) return '<span class="badge approved">✅ Disetujui</span>';
		if (verified === 2) return '<span class="badge rejected">❌ Ditolak</span>';
		return '<span class="badge pending">⏳ Pending</span>';
	}
</script>

<div class="verifikasi-container">
	<div class="header-section">
		<h2>✅ Verifikasi Siswa</h2>
	</div>

	{#if loading}
		<div class="loading-state">
			<Skeleton width="100%" height="200px" />
		</div>
	{:else}
		<div class="content-section">
			<!-- Pending Students -->
			<div class="section">
				<h3>⏳ Menunggu Verifikasi ({pendingList.length})</h3>
				{#if pendingList.length === 0}
					<div class="empty-state">
						<p>Tidak ada siswa menunggu verifikasi</p>
					</div>
				{:else}
					<div class="students-list">
						{#each pendingList as siswa}
							<div class="student-card">
								<div class="student-info">
									<div class="student-name">{siswa.name}</div>
									<div class="student-username">@{siswa.username}</div>
								</div>
								<div class="student-actions">
									<button
										class="btn-approve"
										onclick={() => handleVerify(siswa.id, 'approve')}
										disabled={actionLoading[siswa.id]}
									>
										✅ Terima
									</button>
									<button
										class="btn-reject"
										onclick={() => handleVerify(siswa.id, 'reject', 'Tidak memenuhi syarat')}
										disabled={actionLoading[siswa.id]}
									>
										❌ Tolak
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- All Students -->
			<div class="section">
				<h3>👥 Semua Siswa ({siswaList.length})</h3>
				{#if siswaList.length === 0}
					<div class="empty-state">
						<p>Belum ada siswa di kelas Anda</p>
					</div>
				{:else}
					<div class="students-list">
						{#each siswaList as siswa}
							<div class="student-card">
								<div class="student-info">
									<div class="student-name">{siswa.name}</div>
									<div class="student-username">@{siswa.username}</div>
								</div>
								<div class="student-status">
									{#if siswa.verified === 1}
										<span class="badge approved">✅ Disetujui</span>
									{:else if siswa.verified === 2}
										<span class="badge rejected">❌ Ditolak</span>
									{:else}
										<span class="badge pending">⏳ Pending</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.verifikasi-container {
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
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.section h3 {
		font-size: 1rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 1rem 0;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.75rem;
	}

	.empty-state p {
		color: rgba(255, 255, 255, 0.6);
	}

	.students-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.student-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.student-info {
		flex: 1;
	}

	.student-name {
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 0.25rem;
	}

	.student-username {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.student-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-approve,
	.btn-reject {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 0.375rem;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.btn-approve {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
		border: 1px solid rgba(16, 185, 129, 0.3);
	}

	.btn-reject {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.btn-approve:hover:not(:disabled),
	.btn-reject:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.btn-approve:disabled,
	.btn-reject:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.student-status {
		flex-shrink: 0;
		margin-left: 1rem;
	}

	.badge {
		display: inline-block;
		padding: 0.375rem 0.75rem;
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
</style>
