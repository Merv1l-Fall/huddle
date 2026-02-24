"use client";

import "./GroupIconNav.css";

const GroupIcon = ({
	groupName,
	groupColor,
	groupPhoto,
	width,
}: {
	groupName: string;
	groupColor?: string;
	groupPhoto?: string;
	width?: number;
	onClick?: () => void;
}) => {
	const getInitials = (name: string) => {
		const words = name.trim().split(" ");
		if (words.length === 1) {
			return words[0].charAt(0).toUpperCase();
		}
		return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
	};

	const initials = getInitials(groupName);

	const backgroundStyle = groupPhoto
		? { backgroundImage: `url(${groupPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
		: { backgroundColor: groupColor || "var(--main-green)" };

	return (
		<div className="group-icon" style={{ ...backgroundStyle, width: `${width}rem` || 40, height: width || 40 }}>
			{groupPhoto ? null : initials}
		</div>
	);
};

export default GroupIcon;
