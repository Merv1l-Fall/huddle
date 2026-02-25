"use client"

import { useState } from "react"
import { useGroupNavbarStore } from "@/lib/store/dashboardStore"
import { useDashboardStore } from "@/lib/store/dashboardStore"

import GroupIcon from "./GroupIcon"
import "./GroupIconNav.css"

const GroupsNav = () => {
	const { groups, setActiveGroupId, setGroups } = useGroupNavbarStore();
	const { setShowPopup } = useDashboardStore();


	return(
		<nav className="groups-navbar">
			{groups.map(group => (
				<GroupIcon key={group.id} groupName={group.name} groupColor={group.color} groupPhoto={group.photoUrl} width={3.5} onClick={() => setActiveGroupId(group.id)} />
			))}
			<button data-group-name="Create Group" className="create-group-icon" onClick={() => setShowPopup(true)}>
				<img src="/plus.svg" alt="plus sign" className="plus-icon" />
			</button>
		</nav>
	)
}

export default GroupsNav;