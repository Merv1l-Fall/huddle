"use client";

import "./EventDetail.css";
import { Event } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

interface EventDetailProps {
	event: Event;
	attendeeCount: number;
}

const EventDetail = ({ event, attendeeCount }: EventDetailProps) => {
	return (
		<div className="event-detail">
			<div className="event-detail-header">
				<h2 className="event-detail-title">{event.title}</h2>
				<div className="event-detail-meta">
					<span className="event-detail-datetime">
						{formatDate(event.date)} {formatTime(event.date)}
					</span>
					<div className="event-detail-attendees">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
						</svg>
						<span>{attendeeCount}</span>
					</div>
				</div>
			</div>

			<div className="event-detail-body">
				<p className="event-detail-description">{event.description}</p>

				{event.location && (
					<div className="event-detail-location">
						<h3>Location</h3>
						<p className="location-address">{event.location.address}</p>
						<p className="location-city">{event.location.city}</p>
						<div className="location-map">
							{/* Placeholder for map */}
							<div className="map-placeholder"></div>
						</div>
					</div>
				)}

				<div className="event-detail-guest-list">
					<h3>Guest List</h3>
					{/* Placeholder for guest list - will be implemented later */}
					<div className="guest-list-placeholder">
						<p>Guest list coming soon...</p>
					</div>
				</div>

				<button className="event-detail-rsvp-btn">I'M IN</button>
			</div>
		</div>
	);
};

export default EventDetail;
