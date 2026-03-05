"use client";

import "./EventCard.css";
import { Event } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";
import { respondToEvent } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";

interface EventCardProps {
	event: Event;
	isActive: boolean;
	onClick: () => void;
	attendeeCount: number;
}

const EventCard = ({ event, isActive, onClick, attendeeCount }: EventCardProps) => {
	const { user } = useAuthStore();

	const handleRespond = async (eventId: string, response: "yes" | "no") => {
		if (!user) {
			console.error("User not authenticated");
			return;
		}
		try {
			const idToken = await user.getIdToken();
			await respondToEvent({ eventId, response, idToken });
		} catch (error) {
			console.error("Error responding to event:", error);
		}
	};
	return (
		<div className={`event-card ${isActive ? "active" : ""}`}>
			<div className="event-card-header">
				<h3 className="event-card-title">{event.title}</h3>
			</div>
			<div className="event-card-body">
				<p className="event-card-date">{formatDate(event.date)}</p>
				<p className="event-card-time">At {formatTime(event.date)}</p>
				{event.location && (
					<>
						<p className="event-card-location">{event.location.address}</p>
						<p className="event-card-location">{event.location.city}</p>
					</>
				)}
			</div>
			<div className="event-card-footer">
				<div className="event-card-attendees">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
					</svg>
					<span>{attendeeCount}</span>
				</div>
				<div className="event-card-actions">
					<button className="event-card-info-btn" onClick={onClick}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
						</svg>
					</button>
					<button className="event-card-check-btn" onClick={() => handleRespond(event.id, "yes")}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default EventCard;
