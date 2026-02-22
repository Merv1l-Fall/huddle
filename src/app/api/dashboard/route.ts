import { auth, db } from "@/lib/firebase-admin";

interface DasboardResponse {
	message: string;
	userId: string;
	fetchedUserGroups: { id: string; name: string }[] | [];
	pendingInvites?: { id: string; name: string }[] | [];
}

export async function GET(req: Request): Promise<Response> {
	try {
		const decodedToken = await auth.verifyIdToken(req.headers.get("Authorization")?.split(" ")[1] || "");

		const userDoc = await db.collection("users").doc(decodedToken.uid).get();

		if (!userDoc.exists) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		const userGroups = userDoc.data()?.groupIds || [];

		const pendingInvites = userDoc.data()?.invitedGroups || [];

		if (userGroups.length === 0) {
			return Response.json({ message: "Dashboard accessed", userId: decodedToken.uid, fetchedUserGroups: [], pendingInvites: [] }, { status: 200 });
		}
		
		const fetchGroupNames: string[] = await Promise.all(
			userGroups.map(async (groupId: string) => {
				const groupDoc = await db.collection("groups").doc(groupId).get();
				return groupDoc.data()?.name || "Unknown Group";
			})
		)

		const GroupNamesAndIds = userGroups.map((groupId: string, index: number) => ({
			id: groupId,
			name: fetchGroupNames[index]
		}))

		const data : DasboardResponse = {
			message: "Dashboard accessed",
			userId: decodedToken.uid,
			fetchedUserGroups: GroupNamesAndIds,
			pendingInvites: pendingInvites.length > 0 ? pendingInvites : []
		}

		
		return Response.json(data, { status: 200 });

	} catch (error) {
		if (error instanceof Error) {
			return Response.json(
				{ error: error.message },
				{ status: 500 }
			);
		}


		return Response.json({ error: "An unknown error occurred" }, { status: 500 });
	}
}