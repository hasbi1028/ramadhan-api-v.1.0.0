<script lang="ts">
	import { onMount } from 'svelte';
	import { apiGet, apiPost, apiPut, apiDelete } from '$lib/utils/api';
	import { toastStore } from '$lib/stores/toast.store';
	import Skeleton from '$lib/components/Skeleton.svelte';

	interface User {
		id: number;
		name: string;
		username: string;
		role: string;
		kelas?: string;
	}

	interface ClassItem {
		id: number;
		name: string;
		isActive: number;
	}

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let classesList = $state<ClassItem[]>([]);
	let loading = $state(true);
	let newName = $state('');
	let editingId = $state<number | null>(null);
	let editName = $state('');
	let actionLoading = $state<Record<number, boolean>>({});

	onMount(async () => {
		await loadClasses();
	});

	async function loadClasses() {
		loading = true;
		try {
			const response = await apiGet<{ classes: ClassItem[] }>('/api/admin/classes');

			if (response.data) {
				classesList = response.data.classes;
			}
		} catch (error) {
			console.error('[ClassManagement] Error:', error);
			toastStore.error('Gagal memuat data kelas');
		} finally {
			loading = false;
		}
	}

	async function handleAdd() {
		if (!newName.trim()) {
			toastStore.error('Nama kelas wajib diisi');
			return;
		}

		try {
			const response = await apiPost('/api/admin/classes', { name: newName.trim() });

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success(response.message || 'Kelas berhasil ditambahkan');
				newName = '';
				await loadClasses();
			}
		} catch (error) {
			console.error('[ClassManagement] Add error:', error);
			toastStore.error('Gagal menambahkan kelas');
		}
	}

	async function handleEdit(cls: ClassItem) {
		editingId = cls.id;
		editName = cls.name;
	}

	async function handleSave(cls: ClassItem) {
		if (!editName.trim()) {
			toastStore.error('Nama kelas wajib diisi');
			return;
		}

		actionLoading[cls.id] = true;

		try {
			const response = await apiPut(`/api/admin/classes/${cls.id}`, {
				name: editName.trim()
			});

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success(response.message || 'Kelas berhasil diperbarui');
				editingId = null;
				await loadClasses();
			}
		} catch (error) {
			console.error('[ClassManagement] Update error:', error);
			toastStore.error('Gagal memperbarui kelas');
		} finally {
			delete actionLoading[cls.id];
		}
	}

	async function handleDelete(cls: ClassItem) {
		if (!confirm(`Hapus kelas ${cls.name}?`)) {
			return;
		}

		actionLoading[cls.id] = true;

		try {
			const response = await apiDelete(`/api/admin/classes/${cls.id}`);

			if (response.error) {
				toastStore.error(response.error);
			} else {
				toastStore.success(response.message || 'Kelas berhasil dihapus');
				await loadClasses();
			}
		} catch (error) {
			console.error('[ClassManagement] Delete error:', error);
			toastStore.error('Gagal menghapus kelas');
		} finally {
			delete actionLoading[cls.id];
		}
	}

	function handleCancel() {
		editingId = null;
		editName = '';
	}
</script>

<div class="classmgmt-container">
	<div class="header-section">
		<h2>🏫 Kelola Kelas</h2>
	</div>

	{#if loading}
		<div class="loading-state">
			<Skeleton width="100%" height="200px" />
		</div>
	{:else}
		<div class="content-section">
			<!-- Add Class Form -->
			<div class="add-form">
				<input
					type="text"
					bind:value={newName}
					placeholder="Nama kelas baru"
					onkeydown={(e) => e.key === 'Enter' && handleAdd()}
				/>
				<button class="btn-add" onclick={handleAdd}>
					➕ Tambah
				</button>
			</div>

			<!-- Classes List -->
			{#if classesList.length === 0}
				<div class="empty-state">
					<p>Belum ada kelas</p>
				</div>
			{:else}
				<div class="classes-list">
					{#each classesList as cls}
						<div class="class-card">
							{#if editingId === cls.id}
								<input
									type="text"
									bind:value={editName}
									onkeydown={(e) => e.key === 'Enter' && handleSave(cls)}
								/>
								<div class="class-actions">
									<button class="btn-save" onclick={() => handleSave(cls)}>
										💾
									</button>
									<button class="btn-cancel" onclick={handleCancel}>
										❌
									</button>
								</div>
							{:else}
								<span class="class-name">{cls.name}</span>
								<div class="class-actions">
									<button
										class="btn-edit"
										onclick={() => handleEdit(cls)}
										disabled={actionLoading[cls.id]}
									>
										✏️
									</button>
									<button
										class="btn-delete"
										onclick={() => handleDelete(cls)}
										disabled={actionLoading[cls.id]}
									>
										🗑️
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.classmgmt-container {
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
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.add-form {
		display: flex;
		gap: 0.5rem;
	}

	.add-form input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 1rem;
	}

	.add-form input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.btn-add {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #c9963c 0%, #f0c14b 100%);
		color: #0f3d2e;
		border: none;
		border-radius: 0.5rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.btn-add:hover {
		transform: translateY(-2px);
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.classes-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.class-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.class-card input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.375rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 0.875rem;
		margin-right: 0.5rem;
	}

	.class-name {
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.class-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-save,
	.btn-cancel,
	.btn-edit,
	.btn-delete {
		padding: 0.375rem 0.5rem;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: transform 0.2s;
		font-size: 0.875rem;
	}

	.btn-save {
		background: rgba(16, 185, 129, 0.2);
	}

	.btn-cancel {
		background: rgba(107, 114, 128, 0.2);
	}

	.btn-edit {
		background: rgba(59, 130, 246, 0.2);
	}

	.btn-delete {
		background: rgba(239, 68, 68, 0.2);
	}

	.btn-save:hover:not(:disabled),
	.btn-cancel:hover:not(:disabled),
	.btn-edit:hover:not(:disabled),
	.btn-delete:hover:not(:disabled) {
		transform: scale(1.1);
	}

	.btn-save:disabled,
	.btn-cancel:disabled,
	.btn-edit:disabled,
	.btn-delete:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
