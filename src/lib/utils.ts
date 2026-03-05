// Utility functions for formatting and helpers

export const formatDate = (date: Date) => {
	const d = new Date(date);
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const day = d.getDate();
	const month = months[d.getMonth()];
	const year = d.getFullYear();
	const suffix = day === 1 || day === 21 || day === 31 ? "st" : day === 2 || day === 22 ? "nd" : day === 3 || day === 23 ? "rd" : "th";
	return `${month} ${day}${suffix} - ${year}`;
};

export const formatTime = (date: Date) => {
	const d = new Date(date);
	const hours = d.getHours().toString().padStart(2, "0");
	const minutes = d.getMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}`;
};

type respondToEventInput = {
	eventId: string;
	response: "yes" | "no";
	idToken: string;
}

export const respondToEvent = async ({ eventId, response, idToken }: respondToEventInput) => {
	console.log(`User responded with: ${response}`);

	try{
		const res = await fetch("/api/event/join", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${idToken}`
			},
			body: JSON.stringify({ eventId, response })
		});
		if (!res.ok) {
			const errorData = await res.json();
			console.error("Failed to respond to event:", errorData.error);
			// Optionally, you can show an error message to the user here
		} else {
			console.log("Successfully responded to event");
			//maybe show a success message or update the UI to reflect the response in the future
		}
	} catch (error) {
		console.error("Error responding to event:", error);
		return Response.json({ error: "An error occurred while responding to the event" }, { status: 500 });
	}
};