import { Event } from "@/lib/types"
import "./Event.css"

const EventCard = ({ event }: { event: Event }) => {
	return (
		<div className="event-card">
			<div className="event-card-left">
			<h3>{event.title}</h3>
			<p>{new Date(event.date).toLocaleString()}</p>
			{event.location ? (
				<>
					<p>{event.location.address}</p>
					<p>{event.location.city}</p>
				</>
			) : (
				<p>This is an online event</p>
			)}

			</div>
			<div className="event-card-right">
				<div className="attendence-display">
					<img src="/person_outline.svg" alt="An outline of a person" />
					<p>{Object.values(event.attendees).filter(status => status === 'yes').length}</p>
				</div>
				<button className="event-card-button info">i</button>
				<button className="event-card-button going"><img src="/checkmark.svg" alt="button to mark attendance" /></button>
			</div>
		</div>
	)
}

export default EventCard