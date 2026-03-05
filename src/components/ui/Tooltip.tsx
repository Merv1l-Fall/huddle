"use client";

import { ReactNode, useState, useRef } from "react";
import "./Tooltip.css";

interface TooltipProps {
	label: string;
	children: ReactNode;
}

interface Position {
	top: number;
	left: number;
}

const Tooltip = ({ label, children }: TooltipProps) => {
	const [isVisible, setIsVisible] = useState(false);
	const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
	const wrapperRef = useRef<HTMLDivElement>(null);

	const handleMouseEnter = () => {
		if (wrapperRef.current) {
			const rect = wrapperRef.current.getBoundingClientRect();
			setPosition({
				top: rect.top + rect.height / 2,
				left: rect.right + 8,
			});
		}
		setIsVisible(true);
	};

	return (
		<div
			ref={wrapperRef}
			className="tooltip-wrapper"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={() => setIsVisible(false)}
		>
			{children}
			{isVisible && (
				<div
					className="tooltip-content"
					style={{
						top: `${position.top}px`,
						left: `${position.left}px`,
					}}
				>
					<div className="tooltip-arrow"></div>
					<div className="tooltip-text">{label}</div>
				</div>
			)}
		</div>
	);
};

export default Tooltip;
