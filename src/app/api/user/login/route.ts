//not in use and might not need at all, since Firebase auth handles Login client side

import {auth, db} from "@/lib/firebase-admin";
import { loginSchema } from "@/lib/validation";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		//check if google login
		if (body.idToken) {
			const decodedToken = await auth.verifyIdToken(body.idToken);
			const uid = decodedToken.uid;

			//check if user exists in Firestore
			const userDoc = await db.collection('users').doc(uid).get();

			if (!userDoc.exists) {
				// User doesn't exist - auto-register them
				await db.collection('users').doc(uid).set({
					displayName: decodedToken.name || 'User',
					email: decodedToken.email,
					username: null,
					photoURL: decodedToken.picture || null,
					createdAt: Timestamp.now(),
					groupIds: [],
					needsSetup: true,
				});
				return Response.json(
					{ message: 'User registered successfully', userId: uid, needsSetup: true },
					{ status: 201 }
				);
			}

			// User exists - check if they need setup
			const userData = userDoc.data();
			return Response.json(
				{ message: 'Login successful', userId: uid, needsSetup: !userData?.username },
				{ status: 200 }
			);
		}

		// Validate with Zod
		const validatedData = loginSchema.parse(body);

		if (!validatedData.email || !validatedData.password) {
			return Response.json(
				{ error: 'Email and password are required' },
				{ status: 400 }
			);
		}
		const userEmail = validatedData.email;
		//sign in with Firebase Auth
		const userRecord = await auth.getUserByEmail(userEmail);
		//check password
		// const isPasswordValid = await auth.verifyPassword(userEmail, userRecord.passwordHash);
	}
	catch (error) {
		if (error instanceof z.ZodError) {
			return Response.json(
				{ error: 'Invalid input', details: z.treeifyError(error) },
				{ status: 400 }
			);
		}
		if (error instanceof Error) {
			return Response.json(
				{ error: error.message },
				{ status: 500 }
			);
		}
	}
}