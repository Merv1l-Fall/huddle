import { create } from "zustand";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase-client";

interface AuthState {
	user: User | null;
	loading: boolean;
	setUser: (user: User | null) => void;
	setLoading: (loading: boolean) => void;
	initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	loading: true,
	setUser: (user) => set({ user }),
	setLoading: (loading) => set({ loading }),
	initAuth: () => {
		const auth = getAuth(app);
		onAuthStateChanged(auth, (user) => {
			set({ user: user });
		});
	}
}));