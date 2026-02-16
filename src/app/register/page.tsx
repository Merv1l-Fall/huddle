'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./register.css"
import Link from "next/link";
import RegisterForm from "@/components/forms/RegisterForm";
import { handleGoogleSignIn } from "@/lib/googleAuth";

const RegisterPage = () => {
	const [isEmailAndPassword, setIsEmailAndPassword] = useState(false);
	const router = useRouter();

	const handleGoogleRegister = async () => {
		const result = await handleGoogleSignIn();
		if (result.success) {
			try {
				const response = await fetch('/api/user/register', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ idToken: result.idToken })
				});
				const data = await response.json();
				if(response.ok) {
					console.log("User registered successfully with Google!");
					// Redirect to setup page to choose username
					if (data.needsSetup) {
						router.push('/setup');
					} else {
						router.push('/dashboard');
					}
				} else {
					// Handle server errors
					console.error("Failed to register with Google:", data.error)
				}
			} catch (error) {
				console.error("Error registering user:", error);
			}
		}
	}



return (
	<div className="register-wrapper">
		{isEmailAndPassword ? (
			<div className="register-main-container">
				<h1>Sign up to Huddle with email!</h1>
				<RegisterForm onGoBackToggle={setIsEmailAndPassword} />
			</div>
		) : (
			<div className="register-main-container">
				<h1>Sign up to Huddle!</h1>
				<div className="sign-up-btns">
					<button onClick={handleGoogleRegister} className="sign-up-btn google">{<img src="/google-svg.svg" alt="Google Icon" className="google-icon" />}Sign up with Google</button>
					{/* TODO doubble check routing later */}
					<button onClick={() => setIsEmailAndPassword(true)} className="sign-up-btn email">Sign up with Email</button>
				</div>
				<p>We use Google to identify you, no spam and no ads!</p>

				<Link className="login-link" href="/login">Already have an account? Login here!</Link>
			</div>
		)}

	</div>
);
}


export default RegisterPage;