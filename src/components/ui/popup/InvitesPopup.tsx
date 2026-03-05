"use client"

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useGroupNavbarStore } from "@/lib/store/dashboardStore";
import "./InvitesPopup.css";

interface InvitedGroup {
	id: string;
	name: string;
	createdBy: string;
	memberIds: string[];
}

const InvitesPopup = ({ onGoBackToggle }: { onGoBackToggle: () => void }) => {
	const { user } = useAuthStore();
	const { loadGroups, setPendingInvitesCount } = useGroupNavbarStore();
	const [invitedGroups, setInvitedGroups] = useState<InvitedGroup[]>([]);
	const [loading, setLoading] = useState(true);
	const [responding, setResponding] = useState<string | null>(null);

	useEffect(() => {
		const fetchInvitedGroups = async () => {
			if (!user) return;

			try {
				setLoading(true);
				const idToken = await user.getIdToken();

				// Get the list of invited group IDs from dashboard
				const dashResponse = await fetch("/api/dashboard", {
					headers: { Authorization: `Bearer ${idToken}` },
				});

				if (!dashResponse.ok) throw new Error("Failed to fetch invites");

				const dashData = await dashResponse.json();
				const invitedGroupIds = dashData.pendingInvites || [];

				// Fetch full details for each invited group
				const groupPromises = invitedGroupIds.map((groupId: string) =>
					fetch(`/api/dashboard/${groupId}`, {
						headers: { Authorization: `Bearer ${idToken}` },
					})
						.then((res) => res.json())
						.then((data) => ({
							id: groupId,
							name: data.group.name,
							createdBy: data.group.createdBy,
							memberIds: data.group.memberIds,
						}))
						.catch(() => null)
				);

				const groups = (await Promise.all(groupPromises)).filter(Boolean);
				setInvitedGroups(groups);
			} catch (error) {
				console.error("Error fetching invited groups:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchInvitedGroups();
	}, [user]);

	const handleRespond = async (groupId: string, response: "accept" | "decline") => {
		if (!user) return;

		try {
			setResponding(groupId);
			const idToken = await user.getIdToken();

			const res = await fetch("/api/group/invite/respond", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${idToken}`,
				},
				body: JSON.stringify({ groupId, response }),
			});

			if (!res.ok) throw new Error("Failed to respond to invite");

			// Remove the group from the list optimistically
			setInvitedGroups((prev) => prev.filter((g) => g.id !== groupId));
			
			// Reload groups to update the groups list and pending invites count
			await loadGroups(idToken);
		} catch (error) {
			console.error("Error responding to invite:", error);
		} finally {
			setResponding(null);
		}
	};

	if (loading) {
		return (
			<div className="invites-popup">
				<h2>Invitations</h2>
				<p>Loading...</p>
			</div>
		);
	}

	if (invitedGroups.length === 0) {
		return (
			<div className="invites-popup">
				<h2>Invitations</h2>
				<p className="no-invites">No pending invitations</p>
			</div>
		);
	}

	return (
		<div className="invites-popup">
			<h2>Invitations ({invitedGroups.length})</h2>
			<div className="invites-list">
				{invitedGroups.map((group) => (
					<div key={group.id} className="invite-item">
						<div className="invite-info">
							<h3>{group.name}</h3>
							<p className="invite-meta">{group.memberIds.length} members</p>
						</div>
						<div className="invite-actions">
							<button
								className="invite-btn accept"
								onClick={() => handleRespond(group.id, "accept")}
								disabled={responding === group.id}
							>
								{responding === group.id ? "..." : "Accept"}
							</button>
							<button
								className="invite-btn decline"
								onClick={() => handleRespond(group.id, "decline")}
								disabled={responding === group.id}
							>
								{responding === group.id ? "..." : "Decline"}
							</button>
						</div>
					</div>
				))}
			</div>
			<button className="close-btn" onClick={() => onGoBackToggle()}>Close</button>
		</div>
	);
};

export default InvitesPopup;

