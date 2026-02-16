import {getAuth, signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import { app } from "@/lib/firebase-client";

export const handleGoogleSignIn = async () => {
	const auth = getAuth(app);
	const googleProvider = new GoogleAuthProvider();

	try {
		const result = await signInWithPopup(auth, googleProvider);
		const idToken = await result.user.getIdToken();
		return { success: true, idToken, user: result.user};
	} catch (error) {
		console.error("Google sign-in error:", error);
		return { success: false, error };
	}
}