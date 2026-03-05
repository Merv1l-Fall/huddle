import { create } from "zustand";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase-client";

interface UserProfile {
	uid: string;
	displayName: string;
	email: string;
	username?: string;
	photoURL?: string;
	groupIds: string[];
}

interface AuthState {
	user: User | null;
	profile: UserProfile | null;
	loading: boolean;
	setUser: (user: User | null) => void;
	setProfile: (profile: UserProfile | null) => void;
	setLoading: (loading: boolean) => void;
	fetchProfile: () => Promise<void>;
	initAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	profile: null,
	loading: true,
	setUser: (user) => set({ user }),
	setProfile: (profile) => set({ profile }),
	setLoading: (loading) => set({ loading }),
	fetchProfile: async () => {
		try {
			const user = get().user;
			if (!user) {
				set({ profile: null });
				return;
			}

			const idToken = await user.getIdToken();
			const response = await fetch('/api/user/profile', {
				headers: {
					Authorization: `Bearer ${idToken}`,
				},
			});

			if (response.ok) {
				const profileData = await response.json();
				set({ profile: profileData });
			} else {
				set({ profile: null });
			}
		} catch (error) {
			console.error('Failed to fetch profile:', error);
			set({ profile: null });
		}
	},
	initAuth: () => {
		const auth = getAuth(app);
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			set({ user, loading: false });
			if (user) {
				// Fetch profile data after user is authenticated
				await get().fetchProfile();
			} else {
				set({ profile: null });
			}
		});

		return unsubscribe;
	}
}));