import { verifyRequest } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { z } from "zod";
import { joinEventSchema } from "@/lib/validation";

export async function POST(req: Request) {
	try {
		// Verify user is authenticated
		const decodedToken = await verifyRequest(req);
		const uid = decodedToken.uid;

		// Parse and validate the request body
		const body = await req.json();
		const { eventId, response } = joinEventSchema.parse(body);

		// Check if the event exists
		const eventRef = db.collection("events").doc(eventId);
		const eventDoc = await eventRef.get();
		if (!eventDoc.exists) {
			return Response.json({ error: "Event not found" }, { status: 404, });
		}

		//check if user is a member of the group that the event belongs to
		const eventData = eventDoc.data();
		if (!eventData) {
			return Response.json({ error: "Event data not found" }, { status: 404, });
		}
		const groupId = eventData.groupId;
		const groupDoc = await db.collection("groups").doc(groupId).get();
		if (!groupDoc.exists) {
			return Response.json({ error: "Group not found" }, { status: 404 });
		}
		const groupData = groupDoc.data();
		if (!groupData?.memberIds.includes(uid)) {
			return Response.json({ error: "You are not a member of this group" }, { status: 403, });
		}

		//check if user has already made the same response to the event
		const currentResponse = eventData.attendees?.[uid];
		if (currentResponse === response) {
			return Response.json({ error: `You have already responded with '${response}' to this event` }, { status: 200 });
		}

		// Update the event with the user's response
		await eventRef.update({
			[`attendees.${uid}`]: response,
		});

		return new Response(JSON.stringify({ message: "Event joined successfully" }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: "Validation failed",
				details: z.treeifyError(error) }, { status: 400 });
		}
		
		if (error instanceof Error) {
			if (error.message.includes("No token")) {
				return Response.json({ error: "Unauthorized: No token provided" }, { status: 401 });
			}
			if (error.message.includes("Invalid or expired")) {
				return Response.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
			}
			return Response.json({ error: error.message }, { status: 500 });
		}

		return Response.json({ error: "An unexpected error occurred" }, { status: 500 })
	}
}