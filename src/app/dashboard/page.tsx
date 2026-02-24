"use client";
import GroupsNav from "@/components/ui/dashboard/GroupsNav";
import "./Dashboard.css";
import PopupWrapper from "@/components/ui/popup/PopupWrapper";
import CreateGroupForm from "@/components/forms/CreateGroupForm";
import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";

const DashboardPage = () => {
	const { setShowPopup: setShowPopup, showPopup } = useDashboardStore();

	return (
		<div className="dashboard-wrapper">
			<div className="dashboard-main">
				<div className="dashboard-left">
					<GroupsNav />
				</div>
				<div className="dashboard-center"></div>
				<div className="dashboard-right"></div>
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
