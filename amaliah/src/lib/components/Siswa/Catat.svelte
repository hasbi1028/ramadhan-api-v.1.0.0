<script lang="ts">
	import { onMount } from 'svelte';
	import { apiGet, apiPut, apiPost } from '$lib/utils/api';
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
		parent_signature?: string;
	}

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	const IBADAH = {
		sholat: [
			{ id: 'subuh', label: 'Sholat Subuh (Berjamaah)', pts: 3 },
			{ id: 'dzuhur', label: 'Sholat Dzuhur', pts: 2 },
			{ id: 'ashar', label: 'Sholat Ashar', pts: 2 },
			{ id: 'maghrib', label: 'Sholat Maghrib (Berjamaah)', pts: 3 },
			{ id: 'isya', label: 'Sholat Isya (Berjamaah)', pts: 3 }
		],
		sunnah: [
			{ id: 'sahur', label: 'Makan Sahur', pts: 2 },
			{ id: 'buka', label: 'Berbuka tepat waktu', pts: 2 },
			{ id: 'tarawih', label: 'Sholat Tarawih', pts: 3 },
			{ id: 'witir', label: 'Sholat Witir', pts: 2 },
			{ id: 'duha', label: 'Sholat Dhuha', pts: 2 },
			{ id: 'tahajud', label: 'Sholat Tahajud', pts: 3 },
			{ id: 'rawatib', label: 'Sholat Sunnah Rawatib', pts: 2 }
		],
		tadarus: [
			{ id: 'tadarus', label: "Membaca Al-Qur'an", pts: 3 },
			{ id: 'hafalan', label: "Menghafal/Muraja'ah", pts: 3 },
			{ id: 'dzikir', label: 'Dzikir Pagi & Petang', pts: 2 }
		],
		akhlak: [
			{ id: 'infaq', label: 'Infaq / Sedekah', pts: 3 },
			{ id: 'puasa', label: 'Puasa Penuh (tdk batal)', pts: 5 },
			{ id: 'menahan', label: 'Menjaga Lisan & Perilaku', pts: 3 },
			{ id: 'tilawatquran', label: 'Menyimak kajian/ceramah', pts: 2 },
			{ id: 'berbakti', label: 'Berbakti kepada Orang Tua', pts: 2 }
		]
	};

	let selectedDay = $state(1);
	let openSection = $state<string>('day');
	let data = $state<AmaliahData>({
		checks: {},
		pages: 0,
		catatan: '',
		tema_tarawih: '',
		tema_kultum_subuh: ''
	});
	let loading = $state(false);
	let saving = $state(false);
	let parentName = $state('');
	let signatureData = $state<string | null>(null);
	let useCheckbox = $state(false);

	let isParentVerificationLocked = $derived(data.parent_verified === 1);
	let isFormLocked = $derived(data.parent_verified === 1);

	function toggleSection(id: string) {
		openSection = openSection === id ? '' : id;
	}

	function handleCheck(category: string, id: string) {
		if (isFormLocked) return;

		const key = `${category}_${id}`;
		data.checks[key] = !data.checks[key];
	}

	function calculatePoints() {
		let total = 0;
		const categories = Object.entries(IBADAH) as Array<[string, Array<{ id: string; pts: number }>]>;

		for (const [category, items] of categories) {
			for (const item of items) {
				if (data.checks[`${category}_${item.id}`]) {
					total += item.pts;
				}
			}
		}

		return total;
	}

	async function loadDayData(day: number) {
		loading = true;
		try {
			const response = await apiGet<Record<number, AmaliahData>>('/api/amaliah');

			if (response.data) {
				const dayData = response.data[day];
				if (dayData) {
					data = {
						checks: dayData.checks || {},
						pages: dayData.pages || 0,
						catatan: dayData.catatan || '',
						tema_tarawih: dayData.tema_tarawih || '',
						tema_kultum_subuh: dayData.tema_kultum_subuh || '',
						parent_verified: dayData.parent_verified,
						parent_name: dayData.parent_name,
						parent_signature: dayData.parent_signature
					};
					parentName = dayData.parent_name || '';
					signatureData = dayData.parent_signature || null;
				} else {
					resetData();
				}
			}
		} catch (error) {
			console.error('[Catat] Failed to load data:', error);
			toastStore.error('Gagal memuat data');
		} finally {
			loading = false;
		}
	}

	function resetData() {
		data = {
			checks: {},
			pages: 0,
			catatan: '',
			tema_tarawih: '',
			tema_kultum_subuh: ''
		};
		parentName = '';
		signatureData = null;
	}

	async function saveData() {
		if (isFormLocked) return;

		saving = true;
		try {
			const response = await apiPut(`/api/amaliah/${selectedDay}`, data);

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success(`Hari ${selectedDay} tersimpan`);
			}
		} catch (error) {
			console.error('[Catat] Save error:', error);
			toastStore.error('Gagal menyimpan data');
		} finally {
			saving = false;
		}
	}

	async function handleParentVerify() {
		if (!parentName.trim()) {
			toastStore.error('Nama orang tua wajib diisi');
			return;
		}

		try {
			const response = await apiPost(`/api/amaliah/${selectedDay}/verify-parent`, {
				parent_name: parentName.trim(),
				parent_signature: signatureData,
				use_checkbox: useCheckbox
			});

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success('Verifikasi orang tua berhasil');
				data.parent_verified = 1;
			}
		} catch (error) {
			console.error('[Catat] Parent verify error:', error);
			toastStore.error('Gagal verifikasi');
		}
	}

	function handleDayChange() {
		if (selectedDay >= 1 && selectedDay <= 30) {
			loadDayData(selectedDay);
		}
	}

	onMount(() => {
		handleDayChange();
	});
</script>

<div class="catat-container">
	<div class="header-section">
		<h2>✏️ Catat Amaliah</h2>
		<div class="day-selector">
			<label for="day">Hari ke-</label>
			<select
				id="day"
				bind:value={selectedDay}
				onchange={handleDayChange}
				disabled={loading || isParentVerificationLocked}
			>
				{#each Array.from({ length: 30 }, (_, i) => i + 1) as day (day)}
					<option value={day}>Hari {day}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if loading}
		<div class="loading-state">
			<Skeleton width="100%" height="200px" />
		</div>
	{:else}
		<div class="content-section">
			{#if isParentVerificationLocked}
				<div class="verified-badge">
					✅ Terverifikasi oleh: {data.parent_name}
				</div>
			{/if}

			<!-- Day Section -->
			<div class="section {openSection === 'day' ? 'open' : ''}">
				<button class="section-header" onclick={() => toggleSection('day')} aria-label="Toggle day section">
					<span>📅 Pilih Hari</span>
					<span class="chevron">{openSection === 'day' ? '▼' : '▶'}</span>
				</button>
				{#if openSection === 'day'}
					<div class="section-content">
						<p class="section-desc">Pilih hari di atas untuk melihat/mengisi amaliah</p>
					</div>
				{/if}
			</div>

			<!-- Sholat Section -->
			<div class="section {openSection === 'sholat' ? 'open' : ''}">
				<button class="section-header" onclick={() => toggleSection('sholat')} aria-label="Toggle sholat section">
					<span>🕌 Sholat Fardhu</span>
					<span class="chevron">{openSection === 'sholat' ? '▼' : '▶'}</span>
				</button>
				{#if openSection === 'sholat'}
					<div class="section-content">
						{#each IBADAH.sholat as item (item.id)}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={!!data.checks[`sholat_${item.id}`]}
									disabled={isFormLocked}
									onchange={() => handleCheck('sholat', item.id)}
								/>
								<span>{item.label}</span>
								<span class="points">+{item.pts}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Sunnah Section -->
			<div class="section {openSection === 'sunnah' ? 'open' : ''}">
				<button class="section-header" onclick={() => toggleSection('sunnah')} aria-label="Toggle sunnah section">
					<span>🌟 Ibadah Sunnah</span>
					<span class="chevron">{openSection === 'sunnah' ? '▼' : '▶'}</span>
				</button>
				{#if openSection === 'sunnah'}
					<div class="section-content">
						{#each IBADAH.sunnah as item (item.id)}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={!!data.checks[`sunnah_${item.id}`]}
									disabled={isFormLocked}
									onchange={() => handleCheck('sunnah', item.id)}
								/>
								<span>{item.label}</span>
								<span class="points">+{item.pts}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Tadarus Section -->
			<div class="section {openSection === 'tadarus' ? 'open' : ''}">
				<button class="section-header" onclick={() => toggleSection('tadarus')} aria-label="Toggle tadarus section">
					<span>📖 Tadarus Al-Qur'an</span>
					<span class="chevron">{openSection === 'tadarus' ? '▼' : '▶'}</span>
				</button>
				{#if openSection === 'tadarus'}
					<div class="section-content">
						{#each IBADAH.tadarus as item (item.id)}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={!!data.checks[`tadarus_${item.id}`]}
									disabled={isFormLocked}
									onchange={() => handleCheck('tadarus', item.id)}
								/>
								<span>{item.label}</span>
								<span class="points">+{item.pts}</span>
							</label>
						{/each}
						<div class="pages-input">
							<label for="pages">Jumlah Halaman Qur'an</label>
							<input
								id="pages"
								type="number"
								min="0"
								bind:value={data.pages}
								disabled={isFormLocked}
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- Akhlak Section -->
			<div class="section {openSection === 'akhlak' ? 'open' : ''}">
				<button class="section-header" onclick={() => toggleSection('akhlak')} aria-label="Toggle akhlak section">
					<span>✨ Akhlak & Sosial</span>
					<span class="chevron">{openSection === 'akhlak' ? '▼' : '▶'}</span>
				</button>
				{#if openSection === 'akhlak'}
					<div class="section-content">
						{#each IBADAH.akhlak as item (item.id)}
							<label class="checkbox-item">
								<input
									type="checkbox"
									checked={!!data.checks[`akhlak_${item.id}`]}
									disabled={isFormLocked}
									onchange={() => handleCheck('akhlak', item.id)}
								/>
								<span>{item.label}</span>
								<span class="points">+{item.pts}</span>
							</label>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Tema Section -->
			<div class="section {openSection === 'tema' ? 'open' : ''}">
				<button class="section-header" onclick={() => toggleSection('tema')} aria-label="Toggle tema section">
					<span>📝 Tema Kajian</span>
					<span class="chevron">{openSection === 'tema' ? '▼' : '▶'}</span>
				</button>
				{#if openSection === 'tema'}
					<div class="section-content">
						<div class="form-group">
							<label for="tema_tarawih">Tema Kultum Tarawih</label>
							<input
								id="tema_tarawih"
								type="text"
								bind:value={data.tema_tarawih}
								disabled={isFormLocked}
								placeholder="Contoh: Keutamaan Sholat Malam"
							/>
						</div>
						<div class="form-group">
							<label for="tema_kultum_subuh">Tema Kultum Subuh</label>
							<input
								id="tema_kultum_subuh"
								type="text"
								bind:value={data.tema_kultum_subuh}
								disabled={isFormLocked}
								placeholder="Contoh: Adab Berbicara"
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- Catatan Section -->
			<div class="section {openSection === 'catatan' ? 'open' : ''}">
				<button class="section-header" onclick={() => toggleSection('catatan')} aria-label="Toggle catatan section">
					<span>📝 Catatan</span>
					<span class="chevron">{openSection === 'catatan' ? '▼' : '▶'}</span>
				</button>
				{#if openSection === 'catatan'}
					<div class="section-content">
						<div class="form-group">
							<label for="catatan">Catatan Harian</label>
							<textarea
								id="catatan"
								bind:value={data.catatan}
								disabled={isFormLocked}
								rows="3"
								placeholder="Tulis catatan ibadah hari ini..."
							></textarea>
						</div>
					</div>
				{/if}
			</div>

			<!-- Save Button -->
			{#if !isFormLocked}
				<button class="btn-save" onclick={saveData} disabled={saving}>
					{#if saving}
						<Skeleton width="100px" height="20px" />
					{:else}
						💾 Simpan
					{/if}
				</button>
			{/if}

			<!-- Parent Verification Section -->
			{#if !isParentVerificationLocked}
				<div class="section {openSection === 'verifikasi' ? 'open' : ''}">
					<button class="section-header" onclick={() => toggleSection('verifikasi')} aria-label="Toggle verifikasi section">
						<span>✍️ Verifikasi Orang Tua</span>
						<span class="chevron">{openSection === 'verifikasi' ? '▼' : '▶'}</span>
					</button>
					{#if openSection === 'verifikasi'}
						<div class="section-content">
							<div class="form-group">
								<label for="parent_name">Nama Orang Tua/Wali</label>
								<input
									id="parent_name"
									type="text"
									bind:value={parentName}
									placeholder="Nama lengkap orang tua"
								/>
							</div>
							<button class="btn-verify" onclick={handleParentVerify}>
								✅ Verifikasi
							</button>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Points Summary -->
			<div class="points-summary">
				<div class="points-label">Total Poin:</div>
				<div class="points-value">{calculatePoints()}</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.catat-container {
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
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.75rem;
		padding: 1rem;
	}

	.verified-badge {
		background: rgba(16, 185, 129, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.5);
		color: #10b981;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.section {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		margin-bottom: 0.5rem;
		overflow: hidden;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.03);
		cursor: pointer;
		transition: background 0.2s;
	}

	.section-header:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.section-header span {
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.chevron {
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.section-content {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-desc {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
		margin: 0;
	}

	.checkbox-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0;
		cursor: pointer;
	}

	.checkbox-item input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}

	.checkbox-item span {
		flex: 1;
		color: rgba(255, 255, 255, 0.9);
	}

	.points {
		color: #c9963c;
		font-weight: 700;
		font-size: 0.875rem;
	}

	.pages-input {
		margin-top: 0.5rem;
	}

	.pages-input label {
		display: block;
		margin-bottom: 0.5rem;
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.875rem;
	}

	.pages-input input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.form-group input,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 1rem;
		font-family: inherit;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 5rem;
	}

	.btn-save,
	.btn-verify {
		background: linear-gradient(135deg, #c9963c 0%, #f0c14b 100%);
		color: #0f3d2e;
		border: none;
		border-radius: 0.5rem;
		padding: 0.875rem 1.5rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		margin-top: 0.5rem;
	}

	.btn-save:hover:not(:disabled),
	.btn-verify:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 15px -3px rgba(201, 150, 60, 0.3);
	}

	.btn-save:disabled,
	.btn-verify:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.points-summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: rgba(201, 150, 60, 0.1);
		border: 1px solid rgba(201, 150, 60, 0.3);
		border-radius: 0.5rem;
		margin-top: 1rem;
	}

	.points-label {
		color: rgba(255, 255, 255, 0.8);
		font-weight: 600;
	}

	.points-value {
		color: #c9963c;
		font-size: 1.5rem;
		font-weight: 700;
	}
</style>
