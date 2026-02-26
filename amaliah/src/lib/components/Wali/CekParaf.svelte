<script lang="ts">
	import { onMount } from 'svelte';
	import { apiGet, apiPost } from '$lib/utils/api';
	import { toastStore } from '$lib/stores/toast.store';
	import Skeleton from '$lib/components/Skeleton.svelte';

	interface User {
		id: number;
		name: string;
		username: string;
		role: string;
		kelas?: string;
	}

	interface VerificationSummary {
		id: number;
		name: string;
		username: string;
		kelas: string;
		day: number | null;
		has_data: boolean;
		parent_verified: number;
		parent_name: string | null;
		parent_signature: string | null;
		parent_verified_at: string | null;
		pages: number;
		verification_status: 'verified' | 'pending' | 'no_data';
	}

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let selectedDay = $state(1);
	let summary = $state<VerificationSummary[]>([]);
	let loading = $state(true);
	let resetLoading = $state<Record<number, boolean>>({});

	onMount(() => {
		loadSummary();
	});

	$effect(() => {
		loadSummary();
	});

	async function loadSummary() {
		loading = true;
		try {
			const response = await apiGet<{ summary: VerificationSummary[] }>(
				`/api/wali/verification-summary?day=${selectedDay}`
			);

			if (response.data) {
				summary = response.data.summary;
			}
		} catch (error) {
			console.error('[CekParaf] Error:', error);
			toastStore.error('Gagal memuat data verifikasi');
		} finally {
			loading = false;
		}
	}

	function getStats() {
		const verified = summary.filter((s) => s.verification_status === 'verified').length;
		const pending = summary.filter((s) => s.verification_status === 'pending').length;
		const noData = summary.filter((s) => s.verification_status === 'no_data').length;
		return { verified, pending, noData, total: summary.length };
	}

	async function handleReset(siswaId: number, siswaName: string) {
		if (!confirm(`Reset verifikasi ${siswaName} untuk hari ke-${selectedDay}?`)) {
			return;
		}

		resetLoading[siswaId] = true;

		try {
			const response = await apiPost(`/api/wali/siswa/${siswaId}/reset-verification`, {
				day: selectedDay
			});

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success(response.message || 'Verifikasi berhasil direset');
				await loadSummary();
			}
		} catch (error) {
			console.error('[CekParaf] Reset error:', error);
			toastStore.error('Gagal mereset verifikasi');
		} finally {
			delete resetLoading[siswaId];
		}
	}

	function getStatusBadge(status: string) {
		if (status === 'verified')
			return '<span class="badge verified">✅ Terverifikasi</span>';
		if (status === 'pending')
			return '<span class="badge pending">⏳ Pending</span>';
		return '<span class="badge no-data">— Belum Isi</span>';
	}
</script>

<div class="cekparaf-container">
	<div class="header-section">
		<h2>📝 Cek Paraf Orang Tua</h2>
		<div class="day-selector">
			<label for="day">Hari ke-</label>
			<select id="day" bind:value={selectedDay}>
				{#each Array.from({ length: 30 }, (_, i) => i + 1) as day}
					<option value={day}>Hari {day}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if loading}
		<div class="loading-state">
			<Skeleton width="100%" height="300px" />
		</div>
	{:else}
		<div class="content-section">
			<!-- Stats Badges -->
			<div class="stats-grid">
				<div class="stat-badge verified">
					<div class="stat-value">{getStats().verified}</div>
					<div class="stat-label">Terverifikasi</div>
				</div>
				<div class="stat-badge pending">
					<div class="stat-value">{getStats().pending}</div>
					<div class="stat-label">Pending</div>
				</div>
				<div class="stat-badge no-data">
					<div class="stat-value">{getStats().noData}</div>
					<div class="stat-label">Belum Isi</div>
				</div>
				<div class="stat-badge total">
					<div class="stat-value">{getStats().total}</div>
					<div class="stat-label">Total Siswa</div>
				</div>
			</div>

			<!-- Students List -->
			<div class="students-section">
				<h3>Daftar Siswa ({summary.length})</h3>
				{#if summary.length === 0}
					<div class="empty-state">
						<p>Belum ada data siswa</p>
					</div>
				{:else}
					<div class="students-list">
						{#each summary as siswa}
							<div class="student-card {siswa.verification_status}">
								<div class="student-info">
									<div class="student-name">{siswa.name}</div>
									<div class="student-username">@{siswa.username}</div>
									{#if siswa.parent_verified === 1}
										<div class="parent-info">
											<span class="parent-name">👤 {siswa.parent_name}</span>
											{#if siswa.parent_verified_at}
												<span class="verified-at">
													{new Date(siswa.parent_verified_at).toLocaleDateString('id-ID')}
												</span>
											{/if}
										</div>
									{/if}
								</div>
								<div class="student-status">
									{#if siswa.verification_status === 'verified'}
										<span class="badge verified">✅ Terverifikasi</span>
									{:else if siswa.verification_status === 'pending'}
										<span class="badge pending">⏳ Pending</span>
									{:else}
										<span class="badge no-data">— Belum Isi</span>
									{/if}
								</div>
								{#if siswa.verification_status !== 'no_data'}
									<button
										class="btn-reset"
										onclick={() => handleReset(siswa.id, siswa.name)}
										disabled={resetLoading[siswa.id]}
									>
										🔄 Reset
									</button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.cekparaf-container {
		max-width: 48rem;
		margin: 0 auto;
		padding: 1rem;
	}

	.header-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.header-section h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #c9963c;
		margin: 0;
	}

	.day-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.day-selector label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.day-selector select {
		padding: 0.5rem 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 0.875rem;
	}

	.loading-state {
		margin-top: 1rem;
	}

	.content-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
	}

	.stat-badge {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		padding: 0.75rem;
		text-align: center;
	}

	.stat-badge.verified {
		border-color: rgba(16, 185, 129, 0.3);
		background: rgba(16, 185, 129, 0.05);
	}

	.stat-badge.pending {
		border-color: rgba(234, 179, 8, 0.3);
		background: rgba(234, 179, 8, 0.05);
	}

	.stat-badge.no-data {
		border-color: rgba(107, 114, 128, 0.3);
		background: rgba(107, 114, 128, 0.05);
	}

	.stat-badge.total {
		border-color: rgba(201, 150, 60, 0.3);
		background: rgba(201, 150, 60, 0.05);
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: #c9963c;
	}

	.stat-label {
		font-size: 0.625rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.25rem;
	}

	.students-section h3 {
		font-size: 1rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
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
		gap: 1rem;
	}

	.student-card.verified {
		border-color: rgba(16, 185, 129, 0.3);
		background: rgba(16, 185, 129, 0.05);
	}

	.student-card.pending {
		border-color: rgba(234, 179, 8, 0.3);
		background: rgba(234, 179, 8, 0.05);
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
		margin-bottom: 0.25rem;
	}

	.parent-info {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.student-status {
		flex-shrink: 0;
	}

	.badge {
		display: inline-block;
		padding: 0.375rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.badge.verified {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
	}

	.badge.pending {
		background: rgba(234, 179, 8, 0.2);
		color: #eab308;
	}

	.badge.no-data {
		background: rgba(107, 114, 128, 0.2);
		color: #6b7280;
	}

	.btn-reset {
		padding: 0.5rem 1rem;
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
		flex-shrink: 0;
	}

	.btn-reset:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.btn-reset:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.student-card {
			flex-direction: column;
			align-items: flex-start;
		}

		.student-status {
			margin-top: 0.5rem;
		}

		.btn-reset {
			margin-top: 0.5rem;
		}
	}
</style>
