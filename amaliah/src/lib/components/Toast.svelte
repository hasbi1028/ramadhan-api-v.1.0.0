<script lang="ts">
	import { toastStore } from '$lib/stores/toast.store';
	import type { ToastType } from '$lib/stores/toast.store';

	let toasts = $derived($toastStore);

	function getIcon(type: ToastType): string {
		switch (type) {
			case 'success':
				return '✅';
			case 'error':
				return '❌';
			case 'info':
				return 'ℹ️';
			case 'warning':
				return '⚠️';
			default:
				return '📢';
		}
	}

	function removeToast(id: string) {
		toastStore.remove(id);
	}
</script>

<div
	class="toast-container"
	role="region"
	aria-label="Notifikasi"
>
	{#each toasts as toast (toast.id)}
		<div
			class="toast toast-{toast.type}"
			role="alert"
			aria-live="polite"
		>
			<div class="toast-icon">{getIcon(toast.type)}</div>
			<div class="toast-content">{toast.message}</div>
			<button
				class="toast-close"
				onclick={() => removeToast(toast.id)}
				aria-label="Tutup notifikasi"
			>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 24rem;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border-left: 4px solid;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		animation: slideIn 0.3s ease-out;
		color: white;
	}

	.toast-success {
		background-color: rgb(5 150 105 / 0.95);
		border-color: rgb(16 185 129);
	}

	.toast-error {
		background-color: rgb(220 38 38 / 0.95);
		border-color: rgb(239 68 68);
	}

	.toast-info {
		background-color: rgb(37 99 235 / 0.95);
		border-color: rgb(59 130 246);
	}

	.toast-warning {
		background-color: rgb(202 138 4 / 0.95);
		border-color: rgb(234 179 8);
	}

	.toast-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.toast-content {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.4;
	}

	.toast-close {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
		transition: color 0.2s;
	}

	.toast-close:hover {
		color: white;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.toast-container {
			left: 1rem;
			right: 1rem;
			max-width: none;
		}
	}
</style>
