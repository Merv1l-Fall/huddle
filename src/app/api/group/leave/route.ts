import { verifyRequest } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { leaveGroupSchema } from "@/lib/validation";
import { FieldValue } from "firebase-admin/firestore";
import z from "zod";

export async function POST(req:Request) {
	try {
		//verify user is authenticated
		const decodedToken = await verifyRequest(req)
		const uid = decodedToken.uid;

		const body = await req.json();

		//Validate
		const validatedData = leaveGroupSchema.parse(body);

		//get group data
		const groupRef = db.collection("groups").doc(validatedData.groupId);
		const groupDoc = await groupRef.get();
		//check if group exists
		if (!groupDoc.exists) {
			return Response.json({
				error: "Group not found"
			}, {status: 404})
		}
		const groupData = groupDoc.data();

		//check if user is a member of the group
		if (!groupData?.memberIds.includes(uid)) {
			return Response.json({
				error: "You are not a member of this group"
			}, {status: 403})
		}

		//remove user from group memberIds
		await groupRef.update({
			memberIds: FieldValue.arrayRemove(uid),
			adminIds: FieldValue.arrayRemove(uid)
		});

		//remove group from user's groupIds
		await db.collection("users").doc(uid).update({
			groupIds: FieldValue.arrayRemove(validatedData.groupId)
		});

		return Response.json({
			message: "Left group successfully",
		}, {status: 200})
	} catch (error) {
		//handle zod error
		if (error instanceof z.ZodError) {
			return Response.json ({
				error: "Validation failed",
				details: z.treeifyError(error)
			}, {status: 400})
		}

		//handle firebase errors and auth errors
		if (error instanceof Error) {
			if (error.message.includes('No token')) {
				return Response.json(
				  { error: 'Unauthorized: No token provided' },
				  { status: 401 }
				);
			  }
			  if (error.message.includes('Invalid or expired')) {
				return Response.json(
				  { error: 'Unauthorized: Invalid or expired token' },
				  { status: 401 }
				);
			  }
			return Response.json ({
				error: error.message
			}, {status: 500})
		}
	}
	
}