'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import "../register/auth.css"
import Link from "next/link";
import { handleGoogleSignIn } from "@/lib/googleAuth";
import LoginForm from "@/components/forms/LoginForm";

const LoginPage = () => {
	const [isEmailAndPassword, setIsEmailAndPassword] = useState<boolean>(false);
	const router = useRouter();

	const handleGoogleLogin = async () => {
		const result = await handleGoogleSignIn();
		if (result.success) {
			try {
				const response = await fetch('/api/user/login', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ idToken: result.idToken })
				});
				const data = await response.json();
				if(response.ok) {
					console.log("User logged in successfully with Google!");
					// Redirect to setup page to choose username
					if (data.needsSetup) {
						router.push('/setup');
					} else {
						router.push('/dashboard');
					}
				} else {
					// Handle server errors
					console.error("Failed to login with Google:", data.error)
				}
			} catch (error) {
				console.error("Error logging in user:", error);
			}
		}
	}



return (
	<div className="auth-wrapper">
		{isEmailAndPassword ? (
			<div className="auth-main-container">
				<h1>Sign in to Huddle with email!</h1>
				<LoginForm onGoBackToggle={setIsEmailAndPassword} />
			</div>
		) : (
			<div className="auth-main-container">
				<h1>Sign in to Huddle!</h1>
				<div className="auth-btns">
					<button onClick={handleGoogleLogin} className="auth-btn google">{<img src="/google-svg.svg" alt="Google Icon" className="google-icon" />}Sign in with Google</button>
					{/* TODO doubble check routing later */}
					<button onClick={() => setIsEmailAndPassword(true)} className="auth-btn email">Sign in with Email</button>
				</div>
				<p>We use Google to identify you, no spam and no ads!</p>

				<Link className="auth-link" href="/register">Don't have an account? Register here!</Link>
			</div>
		)}

	</div>
);
}


export default LoginPage;