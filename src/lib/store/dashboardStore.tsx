import { create } from "zustand";
import { GroupDetailResponse, Event } from "../types";

interface DashboardState {
	groupDetails: GroupDetailResponse | null;
	eventDetails: Event | null;
	showPopup: boolean;
	setGroupDetails: (details: GroupDetailResponse) => void;
	clearGroupDetails: () => void;
	setEventDetails: (details: Event) => void;
	clearEventDetails: () => void;
	setShowPopup: (value: boolean) => void;
}

interface GroupNavbarState {
	activeGroupId: string | null;
	groups: { id: string; name: string; photoUrl?: string; color?: string; width?: number; onClick?: () => void }[];
	setActiveGroupId: (groupId: string) => void;
	setGroups: (
		groups: { id: string; name: string; photoUrl?: string; color?: string; onClick?: () => void }[],
	) => void;
	loadGroups: (idToken: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
	groupDetails: null,
	eventDetails: null,
	setGroupDetails: (details) => set({ groupDetails: details }),
	clearGroupDetails: () => set({ groupDetails: null }),
	setEventDetails: (details) => set({ eventDetails: details }),
	clearEventDetails: () => set({ eventDetails: null }),
	showPopup: false,
	setShowPopup: (value) => set({ showPopup: value }),
}));

export const useGroupNavbarStore = create<GroupNavbarState>((set) => ({
	activeGroupId: null,
	groups: [],
	setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),
	setGroups: (groups) => set({ groups }),
	loadGroups: async (idToken: string) => {
		const response = await fetch("/api/dashboard", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		});

		if (!response.ok) {
			const errorPayload = await response.json().catch(() => null);
			const message = errorPayload?.error || `Failed to fetch groups (${response.status})`;
			throw new Error(message);
		}

		const data = (await response.json()) as {
			fetchedUserGroups: { id: string; name: string }[];
		};

		set({
			groups: data.fetchedUserGroups.map((group) => ({
				id: group.id,
				name: group.name,
			})),
		});
	},
}));
