import { verifyRequest } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { updateProfileSchema } from '@/lib/validation';
import {z} from "zod"

export async function GET(req: Request) {
  try {
    // Verify the user is authenticated
    const decodedToken = await verifyRequest(req);
    const uid = decodedToken.uid;

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(uid).get();

	//check if user actually exists
    if (!userDoc.exists) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(
      { uid, ...userDoc.data() },
      { status: 200 }
    );
  } catch (error) {
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

export async function PATCH(req: Request) {
  try {
    // Verify the user is authenticated
    const decodedToken = await verifyRequest(req);
    const uid = decodedToken.uid;

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update only displayName (username is immutable)
    await db.collection('users').doc(uid).update({
      displayName: validatedData.displayName,
    });

    return Response.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation failed', details: z.treeifyError(error) },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
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
