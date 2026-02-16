//not in use and might not need at all, since Firebase auth handles Login client side

import {auth, db} from "@/lib/firebase-admin";
import { loginSchema } from "@/lib/validation";
import { z } from "zod";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		// Validate with Zod
		const validatedData = loginSchema.parse(body);

		const userEmail = validatedData.email;
		//sign in with Firebase Auth
		const userRecord = await auth.getUserByEmail(userEmail);
		//check password
		// const isPasswordValid = await auth.verifyPassword(userEmail, userRecord.passwordHash);
	}
	catch (error) {

	}
}