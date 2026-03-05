import { create } from "zustand";
import { GroupDetailResponse, Event } from "../types";

interface DashboardState {
	groupDetails: GroupDetailResponse | null;
	selectedEventId: string | null;
	showPopup: boolean;
	eventOrGroup: "event" | "group" | "invite" | "invitesList" | null;
	setGroupDetails: (details: GroupDetailResponse) => void;
	clearGroupDetails: () => void;
	setSelectedEventId: (eventId: string | null) => void;
	setShowPopup: (value: boolean) => void;
	loadGroupDetails: (groupId: string, idToken: string) => Promise<void>;
	setEventOrGroup: (value: "event" | "group" | "invite" | "invitesList" | null) => void;
}

interface GroupNavbarState {
	activeGroupId: string | null;
	groups: { id: string; name: string; photoUrl?: string; color?: string; width?: number; onClick?: () => void }[];
	pendingInvitesCount: number;
	setActiveGroupId: (groupId: string) => void;
	setGroups: (
		groups: { id: string; name: string; photoUrl?: string; color?: string; onClick?: () => void }[],
	) => void;
	setPendingInvitesCount: (count: number) => void;
	loadGroups: (idToken: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
	groupDetails: null,
	selectedEventId: null,
	showPopup: false,
	eventOrGroup: null,
	setGroupDetails: (details) => set({ groupDetails: details }),
	clearGroupDetails: () => set({ groupDetails: null, selectedEventId: null }),
	setSelectedEventId: (eventId) => set({ selectedEventId: eventId }),
	setShowPopup: (value) => set({ showPopup: value }),
	setEventOrGroup: (value) => set({ eventOrGroup: value }),
	loadGroupDetails: async (groupId: string, idToken: string) => {
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

		const data = (await response.json()) as GroupDetailResponse;
		set({ groupDetails: data, selectedEventId: data.events.length > 0 ? data.events[0].id : null });
	},
}));

export const useGroupNavbarStore = create<GroupNavbarState>((set) => ({
	activeGroupId: null,
	groups: [],
	pendingInvitesCount: 0,
	setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),
	setGroups: (groups) => set({ groups }),
	setPendingInvitesCount: (count) => set({ pendingInvitesCount: count }),
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
			pendingInvites?: { id: string; name: string }[];
		};

		set({
			groups: data.fetchedUserGroups.map((group) => ({
				id: group.id,
				name: group.name,
			})),
			pendingInvitesCount: data.pendingInvites?.length || 0,
		});
	},
}));
