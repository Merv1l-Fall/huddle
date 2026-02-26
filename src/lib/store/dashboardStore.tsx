import { create } from "zustand";
import { Event } from "../types";
import { groupDetailSchema, GroupDetailResponse } from "../frontendValidation";

interface DashboardState {
	groupDetails: GroupDetailResponse | null;
	eventDetails: Event | null;
	showPopup: boolean;
	activeGroupName: string | null;
	loading: boolean;
	error: string | null;
	setError: (error: string | null) => void;
	setGroupDetails: (details: GroupDetailResponse) => void;
	clearGroupDetails: () => void;
	setEventDetails: (details: Event) => void;
	clearEventDetails: () => void;
	setShowPopup: (value: boolean) => void;
	setActiveGroupName: (name: string | null) => void;
	loadActiveGroup: (idToken: string, groupId: string) => Promise<void>;
	setLoading: (value: boolean) => void;
}

interface GroupNavbarState {
	activeGroupId: string | null;
	groups: { id: string; name: string; photoUrl?: string; groupColor?: string; width?: number; onClick?: () => void }[];
	setActiveGroupId: (groupId: string) => void;
	setGroups: (
		groups: { id: string; name: string; photoUrl?: string; groupColor?: string; onClick?: () => void }[],
	) => void;
	loadGroups: (idToken: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
	groupDetails: null,
	eventDetails: null,
	activeGroupName: null,
	loading: false,
	error: null,
	setError: (error) => set({ error }),
	setLoading: (value) => set({ loading: value }),
	setGroupDetails: (details) => set({ groupDetails: details }),
	clearGroupDetails: () => set({ groupDetails: null }),
	setEventDetails: (details) => set({ eventDetails: details }),
	clearEventDetails: () => set({ eventDetails: null }),
	showPopup: false,
	setShowPopup: (value) => set({ showPopup: value }),
	setActiveGroupName: (name) => set({ activeGroupName: name }),

	loadActiveGroup: async (idToken: string, groupId: string) => {
		const response = await fetch(`/api/dashboard/${groupId}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${idToken}`,
			},
		});

		if (!response.ok) {
			const errorPayload = await response.json().catch(() => null);
			const message = errorPayload?.error || `Failed to fetch group details (${response.status})`;
			throw new Error(message);
		}

		const responseFromApi = (await response.json())

		const result = groupDetailSchema.safeParse(responseFromApi);

		if (!result.success) {
			console.error("Group detail validation failed:", result.error);
			throw new Error("Invalid group details received from server");
		}
		const data = result.data;
		set({ groupDetails: data });
	}
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
			fetchedUserGroups: { id: string; name: string; groupColor?: string }[];
		};

		set({
			groups: data.fetchedUserGroups.map((group) => ({
				id: group.id,
				name: group.name,
				groupColor: group.groupColor,
			})),
		});
	},

}));
