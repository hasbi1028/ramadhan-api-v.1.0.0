<script lang="ts">
	import { onMount } from 'svelte';
	import { initSentry, setUser } from '$lib/sentry';
	import { authStore } from '$lib/stores/auth.store';
	import Toast from '$lib/components/Toast.svelte';
	import '../app.css';

	let { children } = $props();

	// Initialize Sentry on mount
	onMount(() => {
		// Initialize Sentry if DSN is provided
		const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
		if (sentryDsn) {
			initSentry({
				dsn: sentryDsn,
				environment: import.meta.env.MODE || 'development',
				tracesSampleRate: 0.1
			});
		}

		// Initialize auth store
		authStore.init();

		// Subscribe to auth changes to update Sentry user
		const unsubscribe = authStore.subscribe((state) => {
			if (state.user) {
				setUser({
					id: state.user.id.toString(),
					username: state.user.username,
				});
			} else {
				setUser(null);
			}
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<div class="app-container">
	<Toast />
	{@render children()}
</div>

<style>
	:global(.app-container) {
		min-height: 100vh;
		background: linear-gradient(160deg, #0f3d2e 0%, #1a5c45 100%);
	}
</style>
