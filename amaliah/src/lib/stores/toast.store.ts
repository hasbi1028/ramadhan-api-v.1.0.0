import { writable } from 'svelte/store';

/**
 * Toast type definition
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

/**
 * Create toast store
 */
function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	return {
		subscribe,

		/**
		 * Add a toast notification
		 */
		add(toast: Omit<Toast, 'id'>) {
			const id = Math.random().toString(36).substring(2, 9);
			const duration = toast.duration ?? 3000;

			update((toasts) => [
				...toasts,
				{ ...toast, id, duration }
			]);

			// Auto-remove after duration
			if (duration > 0) {
				setTimeout(() => {
					this.remove(id);
				}, duration);
			}

			return id;
		},

		/**
		 * Remove a toast by ID
		 */
		remove(id: string) {
			update((toasts) => toasts.filter((t) => t.id !== id));
		},

		/**
		 * Clear all toasts
		 */
		clear() {
			update(() => []);
		},

		/**
		 * Success toast
		 */
		success(message: string, duration?: number) {
			return this.add({ type: 'success', message, duration });
		},

		/**
		 * Error toast
		 */
		error(message: string, duration?: number) {
			return this.add({ type: 'error', message, duration });
		},

		/**
		 * Info toast
		 */
		info(message: string, duration?: number) {
			return this.add({ type: 'info', message, duration });
		},

		/**
		 * Warning toast
		 */
		warning(message: string, duration?: number) {
			return this.add({ type: 'warning', message, duration });
		}
	};
}

export const toastStore = createToastStore();
