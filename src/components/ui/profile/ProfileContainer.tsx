"use client";

import ProfilePic from "./ProfilePic";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect, useRef, useState } from "react";
import "./ProfileContainer.css";
import { getAuth, signOut } from "firebase/auth";

const ProfileContainer = () => {
	const { profile } = useAuthStore();
	const [isDropDownOpen, setIsDropDownOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const auth = getAuth();

	const handleLogout = async () => {
		try {
			await signOut(auth);
			window.location.reload();
		} catch (error) {
			console.error("Logout error:", error);
		}
	}

	const handleOpenDropDown = () => {
		setIsDropDownOpen((prev) => !prev);
	};

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (!isDropDownOpen) return;

			if (ref.current && !ref.current.contains(e.target as Node)) {
				setIsDropDownOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isDropDownOpen]);

	const DropDown = () => {
		return (
			<div className="profile-dropdown">
				<p className="name-display">{profile?.displayName || profile?.username}</p>
				<p className="change-name-btn">Change Display Name (WIP)</p>
				<p className="change-photo-btn">Change Photo (WIP)</p>
				<p className="logout-btn" onClick={handleLogout}>Logout</p>
			</div>
		);
	};

	return (
		<div className="profile-container" ref={ref} style={{ borderRadius: `0 0 0 ${!isDropDownOpen ? 10 : 0}px` }}>
			<div onClick={handleOpenDropDown}>
				<ProfilePic
					name={profile?.displayName || profile?.username || "User"}
					size={3}
					photoURL={profile?.photoURL}
				/>
			</div>
			{isDropDownOpen && <DropDown />}
		</div>
	);
};

export default ProfileContainer;
