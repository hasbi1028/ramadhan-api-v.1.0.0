<script lang="ts">
	import { authStore } from '$lib/stores/auth.store';
	import { goto } from '$app/navigation';
	import Login from '$lib/components/Auth/Login.svelte';
	import Catat from '$lib/components/Siswa/Catat.svelte';
	import Rekap from '$lib/components/Siswa/Rekap.svelte';
	import Verifikasi from '$lib/components/Wali/Verifikasi.svelte';
	import CekParaf from '$lib/components/Wali/CekParaf.svelte';
	import Dashboard from '$lib/components/Admin/Dashboard.svelte';
	import UserManagement from '$lib/components/Admin/UserManagement.svelte';
	import ClassManagement from '$lib/components/Admin/ClassManagement.svelte';
	import ProfilePage from '$lib/components/Profile/ProfilePage.svelte';

	type Page = 'catat' | 'rekap' | 'verifikasi' | 'cek-paraf' | 'profil' | 'dashboard' | 'users' | 'classes';
	type AdminTab = 'dashboard' | 'wali' | 'siswa' | 'kelas';

	interface User {
		id: number;
		name: string;
		username: string;
		role: 'admin' | 'wali_kelas' | 'siswa';
		kelas?: string;
		verified: number;
	}

	let user = $derived($authStore.user as User | null);
	let currentPage = $state<Page>('catat');
	let adminTab = $state<AdminTab>('dashboard');

	function handleLogout() {
		authStore.logout();
		goto('/');
	}

	function handleUserUpdated(updatedUser: unknown) {
		authStore.updateUser(updatedUser as Partial<User>);
	}

	function getRoleName(role: string): string {
		if (role === 'siswa') return 'Siswa';
		if (role === 'wali_kelas') return 'Wali Kelas';
		return 'Administrator';
	}
</script>

{#if user}
	<div class="app-layout">
		<header class="app-header">
			<div class="header-content">
				<div class="header-brand">
					<div class="brand-logo">📖</div>
					<div class="brand-text">
						<div class="brand-title">Amaliah Ramadhan</div>
						<div class="brand-subtitle">MTS Negeri 2 Kolaka Utara</div>
					</div>
				</div>
				<div class="header-user">
					<div class="user-info">
						<div class="user-name">{user.name}</div>
						<div class="user-role">
							{getRoleName(user.role)}
							{user.kelas ? ` — ${user.kelas}` : ''}
						</div>
					</div>
					<button class="btn-logout" onclick={handleLogout}>
						Keluar
					</button>
				</div>
			</div>
		</header>

		<!-- Navigation -->
		{#if user.role === 'siswa'}
			<nav class="main-nav">
				<button
					class:active={currentPage === 'catat'}
					onclick={() => (currentPage = 'catat')}
				>
					✏️ Catat
				</button>
				<button
					class:active={currentPage === 'rekap'}
					onclick={() => (currentPage = 'rekap')}
				>
					📊 Rekap
				</button>
				<button
					class:active={currentPage === 'profil'}
					onclick={() => (currentPage = 'profil')}
				>
					👤 Profil
				</button>
			</nav>
		{:else if user.role === 'wali_kelas'}
			<nav class="main-nav">
				<button
					class:active={currentPage === 'verifikasi'}
					onclick={() => (currentPage = 'verifikasi')}
				>
					✅ Verifikasi
				</button>
				<button
					class:active={currentPage === 'cek-paraf'}
					onclick={() => (currentPage = 'cek-paraf')}
				>
					📝 Cek Paraf
				</button>
				<button
					class:active={currentPage === 'profil'}
					onclick={() => (currentPage = 'profil')}
				>
					👤 Profil
				</button>
			</nav>
		{:else if user.role === 'admin'}
			<nav class="main-nav">
				<button
					class:active={adminTab === 'dashboard'}
					onclick={() => (adminTab = 'dashboard')}
				>
					🏠 Dashboard
				</button>
				<button
					class:active={adminTab === 'wali'}
					onclick={() => (adminTab = 'wali')}
				>
					👩‍🏫 Wali Kelas
				</button>
				<button
					class:active={adminTab === 'siswa'}
					onclick={() => (adminTab = 'siswa')}
				>
					🎓 Siswa
				</button>
				<button
					class:active={adminTab === 'kelas'}
					onclick={() => (adminTab = 'kelas')}
				>
					🏫 Kelas
				</button>
				<button
					class:active={currentPage === 'profil'}
					onclick={() => (currentPage = 'profil')}
				>
					👤 Profil
				</button>
			</nav>
		{/if}

		<!-- Main Content -->
		<main class="app-main">
			{#if user.role === 'siswa'}
				{#if currentPage === 'catat'}
					<Catat user={user} />
				{:else if currentPage === 'rekap'}
					<Rekap user={user} />
				{:else if currentPage === 'profil'}
					<ProfilePage user={user} onUserUpdated={handleUserUpdated} />
				{:else}
					<Catat user={user} />
				{/if}
			{:else if user.role === 'wali_kelas'}
				{#if currentPage === 'verifikasi'}
					<Verifikasi user={user} />
				{:else if currentPage === 'cek-paraf'}
					<CekParaf user={user} />
				{:else if currentPage === 'profil'}
					<ProfilePage user={user} onUserUpdated={handleUserUpdated} />
				{:else}
					<Verifikasi user={user} />
				{/if}
			{:else if user.role === 'admin'}
				{#if adminTab === 'dashboard'}
					<Dashboard user={user} />
				{:else if adminTab === 'wali'}
					<UserManagement user={user} role="wali_kelas" />
				{:else if adminTab === 'siswa'}
					<UserManagement user={user} role="siswa" />
				{:else if adminTab === 'kelas'}
					<ClassManagement user={user} />
				{:else if currentPage === 'profil'}
					<ProfilePage user={user} onUserUpdated={handleUserUpdated} />
				{:else}
					<Dashboard user={user} />
				{/if}
			{/if}
		</main>

		<footer class="app-footer">
			<div class="footer-text">MTS Negeri 2 Kolaka Utara</div>
			<div class="footer-text">Dibuat oleh hasbi1028</div>
		</footer>
	</div>
{:else}
	<Login />
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	.app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(160deg, #0f3d2e 0%, #1a5c45 100%);
	}

	.app-header {
		background: linear-gradient(160deg, #0f3d2e, #1a5c45);
		padding: 1.25rem 1.5rem;
		border-bottom: 3px solid #c9963c;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 80rem;
		margin: 0 auto;
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.brand-logo {
		font-size: 2rem;
	}

	.brand-text {
		line-height: 1.3;
	}

	.brand-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: #c9963c;
	}

	.brand-subtitle {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 0.05em;
	}

	.header-user {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info {
		text-align: right;
	}

	.user-name {
		font-weight: 700;
		color: #c9963c;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
	}

	.user-role {
		font-size: 0.625rem;
		color: rgba(255, 255, 255, 0.55);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.btn-logout {
		padding: 0.375rem 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.8);
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 700;
		transition: background 0.2s;
	}

	.btn-logout:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	.main-nav {
		display: flex;
		background: #0f3d2e;
		border-bottom: 2px solid #c9963c;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.main-nav button {
		flex: 1;
		padding: 0.875rem 0.5rem;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.45);
		font-family: 'Nunito', sans-serif;
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		transition: color 0.2s, background 0.2s;
	}

	.main-nav button.active {
		color: #f0c14b;
	}

	.main-nav button:hover {
		color: rgba(255, 255, 255, 0.7);
	}

	.app-main {
		flex: 1;
		padding: 1.5rem 1rem;
		max-width: 80rem;
		margin: 0 auto;
		width: 100%;
	}

	.app-footer {
		text-align: center;
		padding: 1rem;
		color: rgba(255, 255, 255, 0.72);
		border-top: 1px solid rgba(201, 150, 60, 0.2);
		margin-top: auto;
	}

	.footer-text {
		font-size: 0.6875rem;
		font-weight: 700;
	}

	.footer-text + .footer-text {
		opacity: 0.9;
		margin-top: 0.25rem;
	}

	@media (max-width: 640px) {
		.header-content {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.header-brand {
			justify-content: center;
		}

		.header-user {
			flex-direction: column;
			gap: 0.5rem;
		}

		.user-info {
			text-align: center;
		}

		.main-nav button {
			padding: 0.75rem 0.25rem;
			font-size: 0.6875rem;
		}
	}
</style>
