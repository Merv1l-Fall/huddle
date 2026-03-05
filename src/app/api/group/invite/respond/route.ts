import { db } from "@/lib/firebase-admin";
import { z } from "zod";
import { verifyRequest } from "@/lib/auth";
import { respondToGroupInviteSchema } from "@/lib/validation";

const groupInviteDataSchema = z.object({
	memberIds: z.array(z.string()).optional().default([]),
	invitedUsers: z.array(z.string()).optional().default([]),
});

export async function POST(req: Request) {
	try {
		//verify user is authenticated
		const decodedToken = await verifyRequest(req);
		const uid = decodedToken.uid;

		const body = await req.json();

		//validate
		const validatedData = respondToGroupInviteSchema.parse(body);
		const { groupId, response } = validatedData;
		const groupRef = db.collection("groups").doc(groupId);

		//check if group exists
		const groupDoc = await groupRef.get();
		if (!groupDoc.exists) {
			return Response.json({ error: "Group not found" }, { status: 404 });
		}

		const groupDataResult = groupInviteDataSchema.safeParse(groupDoc.data());
		if (!groupDataResult.success) {
			return Response.json({ error: "Group data is invalid" }, { status: 500 });
		}

		const groupData = groupDataResult.data;

		//check if user is in invitedUsers array
		if (!groupData?.invitedUsers?.includes(uid)) {
			return Response.json({ error: "You are not invited to this group" }, { status: 403 });
		}

		if (response === "accept") {
			//add user to memberIds array and remove from invitedUsers array in group document
			await groupRef.update({
				memberIds: [...(groupData.memberIds || []), uid],
				invitedUsers: groupData.invitedUsers.filter((invitedUserId) => invitedUserId !== uid),
			});

			// Update user document: add to groupIds, remove from invitedGroups
			const userDoc = await db.collection("users").doc(uid).get();
			const userGroupIds = userDoc.data()?.groupIds || [];
			const userInvitedGroups = userDoc.data()?.invitedGroups || [];

			await db.collection("users").doc(uid).update({
				groupIds: [...userGroupIds, groupId],
				invitedGroups: userInvitedGroups.filter((id: string) => id !== groupId),
			});

			return Response.json({ message: "Invite accepted" }, { status: 200 });
		} else if (response === "decline") {
			//remove user from invitedUsers array in group document
			await groupRef.update({
				invitedUsers: groupData.invitedUsers.filter((invitedUserId) => invitedUserId !== uid),
			});

			// Update user document: remove from invitedGroups
			const userDoc = await db.collection("users").doc(uid).get();
			const userInvitedGroups = userDoc.data()?.invitedGroups || [];

			await db.collection("users").doc(uid).update({
				invitedGroups: userInvitedGroups.filter((id: string) => id !== groupId),
			});

			return Response.json({ message: "Invite declined" }, { status: 200 });
		} else {
			return Response.json({ error: "Invalid response" }, { status: 400 });
		}

	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: "Validation failed", details: z.treeifyError(error) }, { status: 400 });
		}
		if (error instanceof Error) {
			if (error.message.includes("No token")) {
				return Response.json({ error: "Unauthorized" }, { status: 401 });
			}
			return Response.json({ error: error.message }, { status: 500 });
		}

		return Response.json({ error: "An unexpected error occurred" }, { status: 500 });
	}
}