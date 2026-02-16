import { verifyRequest } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { setupSchema } from '@/lib/validation';



export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
    const decodedToken = await verifyRequest(request);
    const uid = decodedToken.uid;

    // Check if user already has a Firestore document
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      // If user already has username, they're fully set up
      if (userData?.username) {
        return Response.json(
          { message: 'User already set up', user: userData },
          { status: 200 }
        );
      }
    }

    // User needs username
    const body = await request.json();
    const validatedData = setupSchema.parse(body);

    // Check if username is already taken
    const usernameQuery = await db.collection('users')
      .where('username', '==', validatedData.username)
      .get();
    
    if (!usernameQuery.empty) {
      return Response.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    if (userDoc.exists) {
      // Update existing user document (Google OAuth flow)
      await db.collection('users').doc(uid).update({
        username: validatedData.username,
        needsSetup: false,
      });
    } else {
      // Create new Firestore user document (shouldn't happen with current flow)
      await db.collection('users').doc(uid).set({
        displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        email: decodedToken.email || '',
        username: validatedData.username,
        photoURL: decodedToken.picture || null,
        createdAt: Timestamp.now(),
        groupIds: [],
      });
    }

    return Response.json(
      { message: 'User setup completed', userId: uid },
      { status: 201 }
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

// GET endpoint to check if user needs setup
export async function GET(request: Request) {
  try {
    const decodedToken = await verifyRequest(request);
    const uid = decodedToken.uid;

    const userDoc = await db.collection('users').doc(uid).get();

    return Response.json({
      exists: userDoc.exists,
      needsSetup: !userDoc.exists,
      user: userDoc.exists ? userDoc.data() : null
    });
  } catch (error) {
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
