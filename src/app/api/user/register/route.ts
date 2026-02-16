import { z } from 'zod';
import { registerSchema } from "@/lib/validation";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate with Zod
    const validatedData = registerSchema.parse(body);

	//check if username is already taken
	const usernameQuery = await db.collection('users').where('username', '==', validatedData.username).get();
	if (!usernameQuery.empty) {
		return Response.json({
			error: "Username is already taken"
		}, {status: 409})
	}

    // Create Firebase user
    const userRecord = await auth.createUser({
      email: validatedData.email,
      password: validatedData.password,
      displayName: validatedData.displayName,
    });

    // Save user data to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      displayName: validatedData.displayName,
      email: validatedData.email,
      username: validatedData.username,
      photoURL: null,
      createdAt: Timestamp.now(),
      groupIds: [],
    });

    return Response.json(
      { message: 'User registered successfully', userId: userRecord.uid },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: z.treeifyError(error) },
        { status: 400 }
      );
    }

    // Handle Firebase errors
    if (error instanceof Error) {
      if (error.message.includes('email-already-exists')) {
        return Response.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}