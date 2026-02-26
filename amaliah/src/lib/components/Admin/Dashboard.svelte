<script lang="ts">
	import { onMount } from 'svelte';
	import { apiGet } from '$lib/utils/api';
	import { toastStore } from '$lib/stores/toast.store';
	import Skeleton from '$lib/components/Skeleton.svelte';

	interface User {
		id: number;
		name: string;
		username: string;
		role: string;
		kelas?: string;
	}

	interface Stats {
		total_wali_kelas: number;
		total_siswa: number;
		pending_wali_kelas: number;
		total_quran_pages: number;
	}

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let stats = $state<Stats>({
		total_wali_kelas: 0,
		total_siswa: 0,
		pending_wali_kelas: 0,
		total_quran_pages: 0
	});
	let loading = $state(true);

	onMount(async () => {
		await loadStats();
	});

	async function loadStats() {
		loading = true;
		try {
			const response = await apiGet<{ stats: Stats }>('/api/admin/stats');

			if (response.data) {
				stats = response.data.stats;
			}
		} catch (error) {
			console.error('[Dashboard] Error:', error);
			toastStore.error('Gagal memuat statistik');
		} finally {
			loading = false;
		}
	}
</script>

<div class="dashboard-container">
	<div class="header-section">
		<h2>🏠 Dashboard Administrator</h2>
	</div>

	{#if loading}
		<div class="loading-state">
			<Skeleton width="100%" height="200px" />
		</div>
	{:else}
		<div class="content-section">
			<!-- Stats Grid -->
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">👩‍🏫</div>
					<div class="stat-value">{stats.total_wali_kelas}</div>
					<div class="stat-label">Total Wali Kelas</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon">🎓</div>
					<div class="stat-value">{stats.total_siswa}</div>
					<div class="stat-label">Total Siswa</div>
				</div>
				<div class="stat-card pending">
					<div class="stat-icon">⏳</div>
					<div class="stat-value">{stats.pending_wali_kelas}</div>
					<div class="stat-label">Pending Wali Kelas</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon">📖</div>
					<div class="stat-value">{stats.total_quran_pages}</div>
					<div class="stat-label">Halaman Qur'an</div>
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="quick-actions">
				<h3>Aksi Cepat</h3>
				<div class="actions-grid">
					<a href="/admin/users?role= wali_kelas" class="action-card">
						<span class="action-icon">👩‍🏫</span>
						<span class="action-label">Kelola Wali Kelas</span>
					</a>
					<a href="/admin/users?role=siswa" class="action-card">
						<span class="action-icon">🎓</span>
						<span class="action-label">Kelola Siswa</span>
					</a>
					<a href="/admin/classes" class="action-card">
						<span class="action-icon">🏫</span>
						<span class="action-label">Kelola Kelas</span>
					</a>
				</div>
			</div>

			<!-- Info Banner -->
			<div class="info-banner">
				<div class="info-icon">📊</div>
				<div class="info-content">
					<div class="info-title">Selamat Datang, {user.name}!</div>
					<div class="info-description">
						Anda memiliki akses penuh untuk mengelola pengguna dan kelas.
						Pantau statistik dan kelola akun dari dashboard ini.
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.dashboard-container {
		max-width: 64rem;
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

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		padding: 1.25rem;
		text-align: center;
		transition: transform 0.2s;
	}

	.stat-card.pending {
		border-color: rgba(234, 179, 8, 0.3);
		background: rgba(234, 179, 8, 0.05);
	}

	.stat-card:hover {
		transform: translateY(-2px);
	}

	.stat-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #c9963c;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.quick-actions h3 {
		font-size: 1rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 1rem 0;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		padding: 1.25rem;
		text-decoration: none;
		transition: transform 0.2s, border-color 0.2s;
	}

	.action-card:hover {
		transform: translateY(-2px);
		border-color: rgba(201, 150, 60, 0.3);
	}

	.action-icon {
		font-size: 2rem;
	}

	.action-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 600;
		text-align: center;
	}

	.info-banner {
		display: flex;
		gap: 1rem;
		background: linear-gradient(135deg, rgba(201, 150, 60, 0.1) 0%, rgba(240, 193, 75, 0.05) 100%);
		border: 1px solid rgba(201, 150, 60, 0.2);
		border-radius: 0.75rem;
		padding: 1.25rem;
	}

	.info-icon {
		font-size: 2.5rem;
		flex-shrink: 0;
	}

	.info-content {
		flex: 1;
	}

	.info-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #c9963c;
		margin-bottom: 0.5rem;
	}

	.info-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.6;
	}

	@media (max-width: 640px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.info-banner {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}
	}
</style>
