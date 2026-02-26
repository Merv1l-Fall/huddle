"use client"

import { useState } from "react"
import { useGroupNavbarStore } from "@/lib/store/dashboardStore"
import { useDashboardStore } from "@/lib/store/dashboardStore"

import GroupIcon from "./GroupIcon"
import "./GroupIconNav.css"
import { useAuthStore } from "@/lib/store/authStore"


const GroupsNav = () => {
	const { groups, setActiveGroupId } = useGroupNavbarStore();
	const { setShowPopup, loadActiveGroup, setActiveGroupName, setLoading, setError } = useDashboardStore();
	const { user, loading: authLoading } = useAuthStore();

	console.log("Groups in Navbar:", groups);

	const handleGroupClick = async (groupId: string, groupName: string) => {
		setLoading(true);
		setActiveGroupId(groupId);
		setActiveGroupName(groupName);
		console.log("Clicked group ID:", groupId);
		if (authLoading || !user) {
			setLoading(false);
			setError("Failed to load group details, try again later");
			return;
		}

		const idToken = await user.getIdToken();
		loadActiveGroup(idToken, groupId).catch((error) => {
			setLoading(false);
			setError("Failed to load group details, try again later");
			console.error("Failed to load group details", error);
		});
		setLoading(false);
	}


	return (
		<nav className="groups-navbar">
			{groups.map(group => (
				<GroupIcon key={group.id} groupName={group.name} groupColor={group.groupColor} groupPhoto={group.photoUrl} width={3.5} onClick={() => handleGroupClick(group.id, group.name)} />
			))}
			<button data-group-name="Create Group" className="create-group-icon" onClick={() => setShowPopup(true)}>
				<img src="/plus.svg" alt="plus sign" className="plus-icon" />
			</button>
		</nav>
	)
}

export default GroupsNav;