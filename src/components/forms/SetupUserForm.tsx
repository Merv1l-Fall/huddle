'use client'

import "./SetupUserForm.css";
import { SetupUserInput, setupUserSchema } from "@/lib/frontendValidation";
import {useForm} from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useState } from "react";

const SetupUserForm = () => {
const router = useRouter();
const { user } = useAuthStore();
const [apiError, setApiError] = useState<string | null>(null);

const { register, handleSubmit, reset, formState: { errors } } = useForm<SetupUserInput>({
	resolver: zodResolver(setupUserSchema),
	mode: "onBlur"
});

const onSubmit = async (data: SetupUserInput) => {
	if (!user) {
		setApiError("You must be logged in");
		return;
	}

	try {
		const idToken = await user.getIdToken();
		const response = await fetch("/api/user/setup", {
			method: "POST",
			headers: { 
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${idToken}`
			},
			body: JSON.stringify({ username: data.username }), // Only send username since backend doesn't need the confirmUsername
		})

		const responseData = await response.json();

		if (response.ok) {
			//if response is ok send user to the dashboard
			setApiError(null);
			reset();
			router.push('/dashboard');
		} else {
			setApiError(responseData.error || 'Setup failed');
		}
	} catch (error) {
		setApiError('An error occurred. Please try again.');
		console.error(error);
	}
}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
		{apiError && <span className="error-message" style={{ display: 'block', marginBottom: '1rem' }}>{apiError}</span>}
		<div className="setup-form-group">
			<label htmlFor="setup-username">Username</label>
			<input
			{...register("username")}
			placeholder="Enter a username" 
			type="text"
			id="setup-username"
			
			/>
			<span className="error-message">
					{errors.username?.message}
			</span>
		</div>
		<div className="setup-form-group">
			<label htmlFor="setup-confirm-username">Confirm Username</label>
			<input
			{...register("confirmUsername")}
			placeholder="Confirm username" 
			type="text"
			id="setup-confirm-username"
			/>
			<span className="error-message">
					{errors.confirmUsername?.message}
			</span>
		</div>

		<button className="setup-confirm-btn" type="submit"> Confirm Username </button>
		</form>
	)
}

export default SetupUserForm