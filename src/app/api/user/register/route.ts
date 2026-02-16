import { z } from 'zod';
import { registerSchema } from "@/lib/validation";
import { auth, db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if this is a Google sign-in (has idToken)
    if (body.idToken) {
      // Google OAuth registration flow
      const decodedToken = await auth.verifyIdToken(body.idToken);
      
      // Check if user already exists
      const existingUser = await db.collection('users').doc(decodedToken.uid).get();
      if (existingUser.exists) {
        // User already exists - auto-login them instead
        const userData = existingUser.data();
        return Response.json(
          { message: 'User already exists. Logged in successfully.', userId: decodedToken.uid, needsSetup: !userData?.username },
          { status: 200 }
        );
      }

      // Create user profile in Firestore (username required later via setup)
      await db.collection('users').doc(decodedToken.uid).set({
        displayName: decodedToken.name || 'User',
        email: decodedToken.email,
        username: null, // Will be set during setup
        photoURL: decodedToken.picture || null,
        createdAt: Timestamp.now(),
        groupIds: [],
        needsSetup: true, // Flag to redirect to setup page
      });

      return Response.json(
        { message: 'User registered with Google successfully', userId: decodedToken.uid, needsSetup: true },
        { status: 201 }
      );
    }

    // Email/Password registration flow
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