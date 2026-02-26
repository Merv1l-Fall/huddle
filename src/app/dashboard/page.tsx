"use client";
import GroupsNav from "@/components/ui/dashboard/GroupsNav";
import "./Dashboard.css";
import PopupWrapper from "@/components/ui/popup/PopupWrapper";
import CreateGroupForm from "@/components/forms/CreateGroupForm";
import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useGroupNavbarStore } from "@/lib/store/dashboardStore";
import { useAuthStore } from "@/lib/store/authStore";

const DashboardPage = () => {
	const { setShowPopup: setShowPopup, showPopup, groupDetails, activeGroupName, loading, error } = useDashboardStore();
	const { loadGroups } = useGroupNavbarStore();
	const { user, loading: authLoading } = useAuthStore();

	useEffect(() => {
		const fetchGroups = async () => {
			if (authLoading || !user) {
				return;
			}

			const idToken = await user.getIdToken();
			await loadGroups(idToken);
		};

		fetchGroups().catch((error) => {
			console.error("Failed to load groups", error);
		});
	}, [authLoading, user, loadGroups]);

	return (
		<div className="dashboard-wrapper">
			<div className="dashboard-main">

				<div className="dashboard-left">
					<GroupsNav />
				</div>
				{loading || error ? (
					<div className="loading-container">
						<div className="spinner"></div>
						{error && <p className="error-message">{error}</p>}
					</div>
				) : (
					<>
						<div className="dashboard-center">
							<div className="dashboard-center-top">
								<h1>{activeGroupName || "Create or join a group to get started!"}</h1>
							</div>
							<div className="dashboard-center-content">
								<h2>Upcoming events in {activeGroupName || "your group"}</h2>
								<div className="events-list">
									{/* {groupDetails && groupDetails.events.length > 0 ? (div) : ()} */}
								</div>
							</div>
							<button className="new-event-btn"><img src="/plus.svg" alt="Create new event" />New event</button>
						</div>
						<div className="dashboard-right"></div>
					</>
				)}
			</div>


			{showPopup && (
				<PopupWrapper onClose={() => setShowPopup(false)}>
					<CreateGroupForm onGoBackToggle={() => setShowPopup(false)} />
				</PopupWrapper>
			)}
		</div>
	);
};

export default DashboardPage;
