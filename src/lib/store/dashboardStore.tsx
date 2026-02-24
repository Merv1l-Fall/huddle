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
}));
