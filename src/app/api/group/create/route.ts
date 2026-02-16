import { verifyRequest } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { z } from "zod";
import { createGroupSchema } from "@/lib/validation";

export async function POST(req: Request) {
	try{
		//verify user is authenticated
		const decodedToken = await verifyRequest(req)
		const uid = decodedToken.uid;

		const body = await req.json();

		//Validate
		const validatedData = createGroupSchema.parse(body);

		//create the group in firestore
		const groupRef = await db.collection("groups").add({
			name: validatedData.name,
			description: validatedData.description || "",
			createdBy: uid,
			createdAt: Timestamp.now(),
			memberIds: [uid],
			adminIds: [uid],
			invitedUsers: [],
			photoURL: null,
		});

		//update user's groupIds
		await db.collection("users").doc(uid).update({
			groupIds: admin.firestore.FieldValue.arrayUnion(groupRef.id)
		});

		return Response.json(
			{
				message: "Group created successfully",
				groupId: groupRef.id
			},
			{ status: 201 }
		);
		
	} catch (error) {
		//handle zod error
		if (error instanceof z.ZodError) {
			return Response.json ({
				error: "Validation failed",
				details: z.treeifyError(error)
			}, {status: 400})
		
		}

		//handle firebase errors
		if (error instanceof Error) {
			return Response.json ({
				error: error.message
			}, {status: 500})
		}

		return Response.json ({
			error: "An unexpected error occurred"
		}, {status: 500})
	}
}