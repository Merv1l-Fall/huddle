import { auth, db } from "@/lib/firebase-admin";
import { GroupDetailResponse, Event } from "@/lib/types";

export async function GET(req: Request, { params }: { params: { groupId: string } }): Promise<Response> {
	try {
		const decodedToken = await auth.verifyIdToken(req.headers.get("Authorization")?.split(" ")[1] || "");
		const groupId = params.groupId;

		if (!groupId) {
			return Response.json({ error: "Group ID is required" }, { status: 400 });
		}
		const userDoc = await db.collection("users").doc(decodedToken.uid).get();

		if (!userDoc.exists) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		const groupDoc = await db.collection("groups").doc(groupId).get();

		if (!groupDoc.exists) {
			return Response.json({ error: "Group not found" }, { status: 404 });
		}

		const groupData = groupDoc.data();

		const eventsQuery = db.collection("events").where("groupId", "==", groupId);

		const eventsSnapshot = await eventsQuery.get();

		const events: Event[] = eventsSnapshot.docs
			.map((doc) => {
				const eventData = doc.data();

				if (!eventData) {
					return null;
				}

				return {
					id: doc.id,
					title: eventData.title,
					description: eventData.description,
					date: eventData.date.toDate(),
					createdBy: eventData.createdBy,
					invitedUsers: eventData.invitedUsers,
					attendees: eventData.attendees || {},
					...(eventData.location && { location: eventData.location }),
				};
			})
			

		const userAttendanceStatus: Record<string, "yes" | "no" | "pending"> = {};

		events.forEach((event) => {
			userAttendanceStatus[event.id] = event.attendees?.[decodedToken.uid] || "pending";
		});

		const data: GroupDetailResponse = {
			group: {
				id: groupDoc.id,
				name: groupData?.name,
				description: groupData?.description,
				createdBy: groupData?.createdBy,
				memberIds: groupData?.memberIds,
				invitedUsers: groupData?.invitedUsers,
				adminIds: groupData?.adminIds,
				createdAt: groupData?.createdAt.toDate(),
				photoURL: groupData?.photoURL || null,
			},
			events: events,
			userAttendanceStatus,
		};
		return Response.json(data, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return Response.json({ error: error.message }, { status: 500 });
		}
	}

	return Response.json({ error: "An unknown error occurred" }, { status: 500 });
}
