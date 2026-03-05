"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/frontendValidation";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { app } from "@/lib/firebase-client";
import { FirebaseError } from "firebase/app";
import "./FormBase.css";

interface LoginFormProps {
	onGoBackToggle: (value: boolean) => void;
}

const LoginForm = ({ onGoBackToggle }: LoginFormProps) => {
	const router = useRouter();
	const [loginError, setLoginError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		mode: "onBlur",
	});

	const handleGoBack = () => {
		reset();
		onGoBackToggle(false);
	};

	const onSubmit = async (data: LoginInput) => {
		try {
			const auth = getAuth(app);
			await signInWithEmailAndPassword(auth, data.email, data.password);
			router.push("/dashboard");
		} catch (error) {
			console.error("Login failed", error);

			if (error instanceof FirebaseError) {
				console.error("Firebase error code:", error.code);
				
				// Check if account exists with different credential (e.g., Google)
				if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
					try {
						const auth = getAuth(app);
						const signInMethods = await fetchSignInMethodsForEmail(auth, data.email);
						
						if (signInMethods.includes("google.com")) {
							setLoginError("This email is registered with Google. Please sign in with Google.");
							return;
						}
					} catch (fetchError) {
						console.error("Error fetching sign-in methods:", fetchError);
					}
					setLoginError("Email or password is incorrect.");
					return;
				}
				
				switch (error.code) {
					case "auth/user-not-found":
						setLoginError("Email or password is incorrect.");
						return;
					case "auth/too-many-requests":
						setLoginError("Too many attempts. Try again later.");
						return;
					case "auth/network-request-failed":
						setLoginError("Network error. Check your internet connection.");
						return;
					default:
						setLoginError("Login failed. Please try again.");
						return;
				}
			}
			if (error instanceof Error) {
				// You can check error.message or error.code for more specific error handling
				console.error("Error message:", error.message);
				setLoginError("Login failed. Please try again.");
			}
		}
	};

	return (
		<form className="form-base" onSubmit={handleSubmit(onSubmit)}>
			<div className="login-form-group">
				<label htmlFor="login-email">Enter your email</label>
				<input
					type="text"
					{...register("email")}
					id="login-email"
					placeholder="Email"
					onChange={() => loginError && setLoginError(null)}
				/>
				<span className="error-message">{errors.email?.message}</span>
			</div>
			<div className="login-form-group">
				<label htmlFor="login-password">Enter your password</label>
				<input
					type="password"
					{...register("password")}
					id="login-password"
					placeholder="Password"
					onChange={() => loginError && setLoginError(null)}
				/>
				<span className="error-message">{errors.password?.message}</span>
			</div>
			<div className="login-error">{loginError && <p className="error-message">{loginError}</p>}</div>
			<div className="login-form-btns">
			<button type="submit" className="login-form-btn login-submit-btn">Login</button>
			<button type="button" onClick={handleGoBack} className="login-form-btn login-go-back-btn">Go Back</button>

			</div>
		</form>
	);
};

export default LoginForm;
