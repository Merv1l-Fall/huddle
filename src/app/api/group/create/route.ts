import { verifyRequest } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { z } from "zod";
import { createGroupSchema} from "@/lib/validation";

const baseHues = [135, 200, 275, 30];

function getRandomGroupColor(): string {
  const base = baseHues[Math.floor(Math.random() * baseHues.length)];
  const hue = base + Math.floor(Math.random() * 20 - 10); // ±10 variation

  return `hsl(${hue}, 60%, 40%)`;
}

export async function POST(req: Request) {
	try{
		//verify user is authenticated
		const decodedToken = await verifyRequest(req)
		const uid = decodedToken.uid;

		const body = await req.json();

		//Validate
		const validatedData = createGroupSchema.parse(body);

		// validatedData.location && 

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
			groupColor: getRandomGroupColor(),
			location: validatedData.location || null
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