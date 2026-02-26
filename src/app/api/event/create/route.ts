import {auth, db} from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { treeifyError, z } from "zod";
import { createEventSchema, CreateEventInput } from "@/lib/validation";

export async function POST(req: Request) {
	try {
		const decodedToken = await auth.verifyIdToken(req.headers.get("Authorization")?.split(" ")[1] || "");
		const uid = decodedToken.uid;
		const body = await req.json();

		const validatedData = createEventSchema.safeParse(body);

		if (!validatedData.success) {
			throw treeifyError(validatedData.error);
		}

		// Check if user is part of the group
		const userDoc = await db.collection("users").doc(uid).get();
		if (!userDoc.exists) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}
		const userData = userDoc.data();
		if (!userData?.groupIds.includes(validatedData.data.groupId)) {
			return Response.json({ error: "User is not a member of this group" }, { status: 403 });
		}

		const newEvent = {
			id: db.collection("events").doc().id,
			groupId: validatedData.data.groupId,
			title: validatedData.data.title,
			description: validatedData.data.description || "",
			date: validatedData.data.date,
			createdBy: uid,
			attendees: {},
			createdAt: Timestamp.now(),
			...(validatedData.data.location && { location: validatedData.data.location }),
		};

		await db.collection("events").doc(newEvent.id).set(newEvent);

		return Response.json(newEvent, { status: 201 });

		} catch (error) {

			if (error instanceof z.ZodError) {
				console.error("Validation error:", error);
				return Response.json(
					{ error: "Invalid input" },
					{ status: 400 }
				);
			}
		return Response.json({ error: "Failed to create event" }, { status: 500 });
	}
}