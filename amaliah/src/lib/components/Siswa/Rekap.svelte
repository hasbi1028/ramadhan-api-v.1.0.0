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

	interface AmaliahData {
		checks: Record<string, boolean>;
		pages: number;
		catatan: string;
		tema_tarawih?: string;
		tema_kultum_subuh?: string;
		parent_verified?: number;
		parent_name?: string;
	}

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let data = $state<Record<number, AmaliahData>>({});
	let loading = $state(true);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const response = await apiGet<Record<number, AmaliahData>>('/api/amaliah');

			if (response.data) {
				data = response.data;
			}
		} catch (error) {
			console.error('[Rekap] Failed to load data:', error);
			toastStore.error('Gagal memuat data rekap');
		} finally {
			loading = false;
		}
	}

	function getDaysRecorded() {
		return Object.keys(data).length;
	}

	function getTotalPages() {
		return Object.values(data).reduce((sum, day) => sum + (day.pages || 0), 0);
	}

	function getVerifiedDays() {
		return Object.values(data).filter((day) => day.parent_verified === 1).length;
	}

	function calculateTotalPoints() {
		let total = 0;

		for (const day of Object.values(data)) {
			for (const [key, checked] of Object.entries(day.checks || {})) {
				if (checked) {
					// Extract points from check data (simplified)
					total += 2; // Average points per check
				}
			}
		}

		return total;
	}

	function getProgressPercentage() {
		const totalDays = 30;
		const recordedDays = getDaysRecorded();
		return Math.round((recordedDays / totalDays) * 100);
	}
</script>

<div class="rekap-container">
	<div class="header-section">
		<h2>📊 Rekap Amaliah</h2>
	</div>

	{#if loading}
		<div class="loading-state">
			<Skeleton width="100%" height="300px" />
		</div>
	{:else}
		<div class="content-section">
			<!-- Progress Ring -->
			<div class="progress-section">
				<div class="progress-ring">
					<svg viewBox="0 0 120 120">
						<circle
							class="progress-bg"
							cx="60"
							cy="60"
							r="52"
						/>
						<circle
							class="progress-bar"
							cx="60"
							cy="60"
							r="52"
							style="stroke-dashoffset: {100 - getProgressPercentage()}"
						/>
					</svg>
					<div class="progress-text">
						<div class="progress-value">{getProgressPercentage()}%</div>
						<div class="progress-label">Progress</div>
					</div>
				</div>
			</div>

			<!-- Stats Cards -->
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">📝</div>
					<div class="stat-value">{getDaysRecorded()}</div>
					<div class="stat-label">Hari Tercatat</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon">✅</div>
					<div class="stat-value">{getVerifiedDays()}</div>
					<div class="stat-label">Terverifikasi</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon">📖</div>
					<div class="stat-value">{getTotalPages()}</div>
					<div class="stat-label">Halaman Qur'an</div>
				</div>
				<div class="stat-card">
					<div class="stat-icon">⭐</div>
					<div class="stat-value">{calculateTotalPoints()}</div>
					<div class="stat-label">Total Poin</div>
				</div>
			</div>

			<!-- Days List -->
			<div class="days-section">
				<h3>Riwayat Amaliah</h3>
				{#if getDaysRecorded() === 0}
					<div class="empty-state">
						<p>Belum ada data amaliah</p>
						<a href="/catat" class="btn-catat">Catat Amaliah</a>
					</div>
				{:else}
					<div class="days-list">
						{#each Object.entries(data).sort(([a], [b]) => parseInt(a) - parseInt(b)) as [day, dayData]}
							<div class="day-card {dayData.parent_verified === 1 ? 'verified' : ''}">
								<div class="day-header">
									<span class="day-title">Hari {day}</span>
									{#if dayData.parent_verified === 1}
										<span class="verified-badge">✅</span>
									{:else}
										<span class="pending-badge">⏳</span>
									{/if}
								</div>
								<div class="day-stats">
									<span>📖 {dayData.pages || 0} halaman</span>
									<span>✓ {Object.keys(dayData.checks || {}).length} ibadah</span>
								</div>
								{#if dayData.catatan}
									<div class="day-catatan">{dayData.catatan}</div>
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
	.rekap-container {
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

	.progress-section {
		display: flex;
		justify-content: center;
		padding: 1rem;
	}

	.progress-ring {
		position: relative;
		width: 160px;
		height: 160px;
	}

	.progress-ring svg {
		transform: rotate(-90deg);
		width: 100%;
		height: 100%;
	}

	.progress-bg {
		fill: none;
		stroke: rgba(255, 255, 255, 0.1);
		stroke-width: 8;
	}

	.progress-bar {
		fill: none;
		stroke: #c9963c;
		stroke-width: 8;
		stroke-linecap: round;
		stroke-dasharray: 326.73;
		stroke-dashoffset: calc(326.73 * (100 - getProgressPercentage()) / 100);
		transition: stroke-dashoffset 0.5s ease;
	}

	.progress-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}

	.progress-value {
		font-size: 2rem;
		font-weight: 700;
		color: #c9963c;
	}

	.progress-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		padding: 1rem;
		text-align: center;
	}

	.stat-icon {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.stat-value {
		font-size: 1.5rem;
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

	.days-section h3 {
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
		margin-bottom: 1rem;
	}

	.btn-catat {
		display: inline-block;
		background: linear-gradient(135deg, #c9963c 0%, #f0c14b 100%);
		color: #0f3d2e;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-weight: 700;
		text-decoration: none;
		transition: transform 0.2s;
	}

	.btn-catat:hover {
		transform: translateY(-2px);
	}

	.days-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.day-card {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.day-card.verified {
		border-color: rgba(16, 185, 129, 0.3);
		background: rgba(16, 185, 129, 0.05);
	}

	.day-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.day-title {
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
	}

	.verified-badge,
	.pending-badge {
		font-size: 0.875rem;
	}

	.day-stats {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 0.5rem;
	}

	.day-catatan {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
