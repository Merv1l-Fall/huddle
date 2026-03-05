import { db } from "@/lib/firebase-admin";
import { z } from "zod";
import { verifyRequest } from "@/lib/auth";
import { inviteToGroupSchema } from "@/lib/validation";

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
		const validatedData = inviteToGroupSchema.parse(body);
		const { groupId, username } = validatedData;

		//check if group exists
		const groupRef = db.collection("groups").doc(groupId);
		const groupDoc = await groupRef.get();
		if (!groupDoc.exists) {
			return Response.json({ error: "Group not found" }, { status: 404 });
		}

		//check if user inviting is a member of the group
		const groupDataResult = groupInviteDataSchema.safeParse(groupDoc.data());
		if (!groupDataResult.success) {
			return Response.json({ error: "Group data is invalid" }, { status: 500 });
		}

		const groupData = groupDataResult.data;

		if (!groupData.memberIds.includes(uid)) {
			return Response.json({ error: "You are not a member of this group" }, { status: 403 });
		}

		//check if user to be invited exists
		const usersQuery = await db.collection("users").where("username", "==", username).get();
		if (usersQuery.empty) {
			return Response.json({ error: "User not found" }, { status: 404 });
		}

		//check if user to be invited is already a member of the group
		const invitedUserDoc = usersQuery.docs[0];
		const invitedUserId = invitedUserDoc.id;
		if (groupData.memberIds.includes(invitedUserId)) {
			return Response.json({ error: "User is already a member of the group" }, { status: 400 });
		}
		if (groupData.invitedUsers.includes(invitedUserId)) {
			return Response.json({ error: "User is already invited to this group" }, { status: 400 });
		}

		//add user to invitedUsers array in group document
		await groupRef.update({
			invitedUsers: [...groupData.invitedUsers, invitedUserId],
		});

		// Also add group to user's invitedGroups array
		await db.collection("users").doc(invitedUserId).update({
			invitedGroups: [...(invitedUserDoc.data()?.invitedGroups || []), groupId],
		});

		return Response.json({ message: "User invited successfully" }, { status: 200 });

	} catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json({ error: "Validation failed", details: z.treeifyError(error) }, { status: 400 });
		}
		if (error instanceof Error) {
			if (error.message.includes("No token")) {
				return Response.json({ error: "Unauthorized" }, { status: 401 });
			}
			if (error.message.includes("User not found")) {
				return Response.json({ error: "User not found" }, { status: 404 });
			}
			if (error.message.includes("You are not a member of this group")) {
				return Response.json({ error: "You are not a member of this group" }, { status: 403 });
			}
			if (error.message.includes("User is already a member of the group")) {
				return Response.json({ error: "User is already a member of the group" }, { status: 400 });
			}
			return Response.json({ error: error.message }, { status: 500 });
		}
		console.error("Error inviting user to group:", error);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}