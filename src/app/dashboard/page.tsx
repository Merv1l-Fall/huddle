"use client";
import GroupsNav from "@/components/ui/dashboard/GroupsNav";
import EventCard from "@/components/ui/dashboard/EventCard";
import EventDetail from "@/components/ui/dashboard/EventDetail";
import "./Dashboard.css";
import PopupWrapper from "@/components/ui/popup/PopupWrapper";
import CreateGroupForm from "@/components/forms/CreateGroupForm";
import { useEffect} from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useGroupNavbarStore } from "@/lib/store/dashboardStore";
import { useAuthStore } from "@/lib/store/authStore";
import CreateEventForm from "@/components/forms/CreateEventForm";
import InviteUserForm from "@/components/forms/InviteUserForm";
import { useRouter } from "next/navigation";
import ProfileContainer from "@/components/ui/profile/ProfileContainer";
import InvitesPopup from "@/components/ui/popup/InvitesPopup";

const DashboardPage = () => {
	const router = useRouter();
	const { setShowPopup, showPopup, groupDetails, selectedEventId, setSelectedEventId, loadGroupDetails, setEventOrGroup, eventOrGroup } =
		useDashboardStore();
	const { loadGroups, activeGroupId } = useGroupNavbarStore();
	const { user, loading: authLoading } = useAuthStore();

	const handleInviteUser = () => {
		if (!activeGroupId) return;
		setEventOrGroup("invite");
		setShowPopup(true);
	}


	const closePopup = () => {
		setShowPopup(false);
		setEventOrGroup(null);
	};


	const openCreateEventForm = () => {
		setEventOrGroup("event");
		setShowPopup(true);
	}

	useEffect(() => {
		const fetchGroups = async () => {
			if (!user) {
				router.push("/login");
				return;
			}
			if (authLoading || !user) return;
			

			const idToken = await user.getIdToken();
			await loadGroups(idToken);
		};

		fetchGroups().catch((error) => {
			console.error("Failed to load groups", error);
		});
	}, [authLoading, user, loadGroups]);

	useEffect(() => {
		const fetchGroupDetails = async () => {
			if (!activeGroupId || !user) {
				return;
			}

			const idToken = await user.getIdToken();
			await loadGroupDetails(activeGroupId, idToken);
		};

		fetchGroupDetails().catch((error) => {
			console.error("Failed to load group details", error);
		});
	}, [activeGroupId, user, loadGroupDetails]);

	const selectedEvent = groupDetails?.events.find((event) => event.id === selectedEventId);

	return (
		<div className="dashboard-wrapper">
			<div className="dashboard-main">
				<ProfileContainer />
				<div className="dashboard-left">
					<GroupsNav />
				</div>
				<div className="dashboard-center">
					{activeGroupId && groupDetails ? (
						<>
							<div className="dashboard-center-header">
								<h2>{groupDetails.group.name}</h2>
								<button className="invite-user-btn" onClick={handleInviteUser}>
									<img src="/plus.svg" alt="invite friends button" className="floating-plus-icon" />
									Invite Friends
								</button>
							</div>
							<div className="dashboard-center-events">
								{groupDetails.events.length > 0 ? (
									groupDetails.events.map((event) => {
										const attendeeCount = Object.values(event.attendees || {}).filter(
											(status) => status === "yes",
										).length;
										return (
											<EventCard
												key={event.id}
												event={event}
												isActive={selectedEventId === event.id}
												onClick={() => setSelectedEventId(event.id)}
												attendeeCount={attendeeCount}
											/>
										);
									})
								) : (
									<div className="no-events">
										<p>No events yet. Create your first event!</p>
									</div>
								)}
							</div>
						</>
					) : (
						<div className="no-group-selected">
							<p>Select a group to view events</p>
						</div>
					)}
					{activeGroupId && <>
					<button className="create-event-btn" onClick={openCreateEventForm}>
						<img
							src="/plus.svg"
							alt="plus sign"
							className="floating-plus-icon"
						/>
						New Event
					</button>
					</>}
				</div>
				<div className="dashboard-right">
					
					{selectedEvent ? (
						<EventDetail
							event={selectedEvent}
							attendeeCount={
								Object.values(selectedEvent.attendees || {}).filter((status) => status === "yes").length
							}
						/>
					) : (
						<div className="no-event-selected">
							<p>Select an event to view details</p>
						</div>
					)}
				</div>
			</div>

			{showPopup && (
				<PopupWrapper onClose={() => closePopup()}>
					{eventOrGroup === "group" ? (
						<CreateGroupForm onGoBackToggle={() => closePopup()} />
					) : eventOrGroup === "event" ? (
						<CreateEventForm onGoBackToggle={() => closePopup()} />
					) : eventOrGroup === "invite" ? (
						<InviteUserForm onGoBackToggle={() => closePopup()} />
					) : eventOrGroup === "invitesList" ? (
						<InvitesPopup onGoBackToggle={() => closePopup()} />
					) : null}
				</PopupWrapper>
			)}
		</div>
	);
};

export default DashboardPage;
