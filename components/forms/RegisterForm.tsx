'use client'

import { useState } from "react"

const RegisterForm = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		displayName: "",
		username: "",
	})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}
	
	const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
	}

	return (
		<form onSubmit={handleSubmit}>
			<input type="text" name="displayName" id="register-display-name" placeholder="Display Name" value={formData.displayName} onChange={handleChange} />

			<input type="text" name="username" id="register-username" placeholder="Username" value={formData.username} onChange={handleChange} />

			<input type="email" name="email" id="register-email" placeholder="Email" value={formData.email} onChange={handleChange} />

			<input type="password" name="password" id="register-password" placeholder="Password" value={formData.password} onChange={handleChange} />

			<button type="submit">Register</button>
		</form>
	)
}