'use client'

import { useState } from "react";
import "./register.css"
import Link from "next/link";

const RegisterPage = () => {
	const [isEmailAndPassword, setIsEmailAndPassword] = useState(false);

	return (
		<div className="register-wrapper">
			{isEmailAndPassword ? (
				<div className="email-and-password-container">
					<h1>Sign up with Email</h1>
				</div>
			) : (
				<div className="register-main-container">
					<h1>Sign up to Huddle!</h1>
					<div className="sign-up-btns">
						<button className="sign-up-btn google">{<img src="/google-svg.svg" alt="Google Icon" className="google-icon" />}Sign up with Google</button>
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