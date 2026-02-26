import { writable } from 'svelte/store';

/**
 * User type definition
 */
export interface User {
	id: number;
	name: string;
	username: string;
	role: 'admin' | 'wali_kelas' | 'siswa';
	kelas?: string;
	verified: number;
	rejected_reason?: string;
	must_change_password?: number;
}

/**
 * Auth state type
 */
export interface AuthState {
	user: User | null;
	token: string | null;
	loading: boolean;
}

/**
 * Create auth store with localStorage persistence
 */
function createAuthStore() {
	const initialState: AuthState = {
		user: null,
		token: null,
		loading: true
	};

	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		/**
		 * Initialize auth state from localStorage
		 */
		init() {
			if (typeof window === 'undefined') return;

			const token = localStorage.getItem('rm_token');
			const userStr = localStorage.getItem('rm_user');

			if (token && userStr) {
				try {
					const user = JSON.parse(userStr) as User;
					set({ user, token, loading: false });
				} catch (error) {
					console.error('[Auth] Invalid user data in localStorage, clearing session');
					localStorage.removeItem('rm_token');
					localStorage.removeItem('rm_user');
					set({ user: null, token: null, loading: false });
				}
			} else {
				set({ user: null, token: null, loading: false });
			}
		},

		/**
		 * Set authenticated user
		 */
		login(user: User, token: string) {
			if (typeof window === 'undefined') return;

			localStorage.setItem('rm_token', token);
			localStorage.setItem('rm_user', JSON.stringify(user));
			set({ user, token, loading: false });
		},

		/**
		 * Clear auth state
		 */
		logout() {
			if (typeof window === 'undefined') return;

			localStorage.removeItem('rm_token');
			localStorage.removeItem('rm_user');
			set({ user: null, token: null, loading: false });
		},

		/**
		 * Update user data
		 */
		updateUser(user: Partial<User>) {
			update((state) => {
				if (!state.user) return state;

				const updatedUser = { ...state.user, ...user };

				if (typeof window !== 'undefined') {
					localStorage.setItem('rm_user', JSON.stringify(updatedUser));
				}

				return { ...state, user: updatedUser };
			});
		}
	};
}

export const authStore = createAuthStore();
