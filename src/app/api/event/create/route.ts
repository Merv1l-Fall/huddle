import { verifyRequest } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { createEventSchema } from "@/lib/validation";

export async function POST(req: Request) {
	try {
		// Verify user is authenticated
		const decodedToken = await verifyRequest(req);
		const uid = decodedToken.uid;

		const body = await req.json();

		// Validate
		const validatedData = createEventSchema.parse(body);
		const groupId = body.groupId;

		if (!groupId) {
			return Response.json({ error: "Group ID is required" }, { status: 400 });
		}

		// Check if group exists and user is a member
		const groupDoc = await db.collection("groups").doc(groupId).get();

		if (!groupDoc.exists) {
			return Response.json({ error: "Group not found" }, { status: 404 });
		}

		const groupData = groupDoc.data();

		if (!groupData?.memberIds.includes(uid)) {
			return Response.json({ error: "You are not a member of this group" }, { status: 403 });
		}

		//Get lat and lng based on adress if location is included using nominatim openstreetmap api
		if (validatedData.location && !validatedData.location.lat && !validatedData.location.lng) {
			const query = `${validatedData.location.address}, ${validatedData.location.city}`;

			const geocodeResponse = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
				{
					headers: {
						"User-Agent": "HuddleExamProject/1.0 (vilmer.fall@gmail.com)",
					},
				},
			);

			if (!geocodeResponse.ok) {
				throw new Error("Geocoding failed");
			}

			const geocodeData = await geocodeResponse.json();

			if (!geocodeData || geocodeData.length === 0) {
				throw new Error("Address not found");
			}

			validatedData.location = {
				...validatedData.location,
				lat: Number(geocodeData[0].lat),
				lng: Number(geocodeData[0].lon),
			};
		}

		// Create the event in firestore
		const eventRef = await db.collection("events").add({
			groupId: groupId,
			title: validatedData.title,
			description: validatedData.description || "",
			date: new Date(validatedData.date),
			createdBy: uid,
			createdAt: Timestamp.now(),
			invitedUsers: [],
			attendees: {
				[uid]: "yes",
			},
			location: validatedData.location || null,
		});

		return Response.json(
			{
				message: "Event created successfully",
				eventId: eventRef.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		// Handle zod error
		if (error instanceof z.ZodError) {
			return Response.json(
				{
					error: "Validation failed",
					details: z.treeifyError(error),
				},
				{ status: 400 },
			);
		}

		// Handle firebase errors and auth errors
		if (error instanceof Error) {
			if (error.message.includes("No token")) {
				return Response.json({ error: "Unauthorized: No token provided" }, { status: 401 });
			}
			if (error.message.includes("Invalid or expired")) {
				return Response.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
			}
			return Response.json({ error: error.message }, { status: 500 });
		}

		return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
	}
}
