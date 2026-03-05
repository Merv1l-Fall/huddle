"use client"

import { useGroupNavbarStore } from "@/lib/store/dashboardStore"
import { useDashboardStore } from "@/lib/store/dashboardStore"

import GroupIcon from "./GroupIcon"
import Tooltip from "@/components/ui/Tooltip"
import "./GroupIconNav.css"

const GroupsNav = () => {
	const { groups, setActiveGroupId, activeGroupId, pendingInvitesCount } = useGroupNavbarStore();
	const { setShowPopup, setEventOrGroup } = useDashboardStore();

	const openCreateGroupForm = () => {
		setEventOrGroup("group");
		setShowPopup(true);
	}

	const opnenInvites = () => {
		setEventOrGroup("invitesList");
		setShowPopup(true);
	}

	const fetchInvites = async () => {

	}


	return(
		<nav className="groups-navbar">
			<Tooltip label="Invites">
				<button className="group-invites-icon" onClick={() => opnenInvites()}>
					<img className="envelope-icon" src="/envelope.svg" alt="Invites" />
					{pendingInvitesCount > 0 && <span className="invites-count">{pendingInvitesCount}</span>}
				</button>
			</Tooltip>
			{groups.map(group => (
				<Tooltip key={group.id} label={group.name}>
					<GroupIcon 
						groupName={group.name} 
						groupColor={group.color} 
						groupPhoto={group.photoUrl} 
						width={3.5} 
						onClick={() => setActiveGroupId(group.id)}
						isActive={activeGroupId === group.id}
					/>
				</Tooltip>
			))}
			<Tooltip label="Create Group">
				<button className="create-group-icon" onClick={() => openCreateGroupForm()}>
					<img src="/plus.svg" alt="plus sign" className="plus-icon" />
				</button>
			</Tooltip>
		</nav>
	)
}

export default GroupsNav;