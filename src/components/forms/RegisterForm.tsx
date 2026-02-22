'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterInput, registerSchema } from '@/lib/validation';
import './RegisterForm.css';
import { useRouter } from 'next/navigation';

interface RegisterFormProps {
	onGoBackToggle: (value: boolean) => void;
}


const RegisterForm = ({ onGoBackToggle }: RegisterFormProps) => {
	const router = useRouter();
	const [registrationError, setRegistrationError] = useState<string | null>(null);

	const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		mode: "onBlur" //Might need to doubblechek UX
	});

	const handleGoBack = () => {
		reset();
		setRegistrationError(null);
		onGoBackToggle(false);
	}

	const onSubmit = async (data: RegisterInput) => {
		setRegistrationError(null);
		try {
			const response = await fetch('/api/user/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			const responseData = await response.json();

			if (response.ok) {
				console.log('Registration successful');
				router.push('/dashboard');
			} else {
				// Handle API errors
				console.error('Registration failed:', responseData.error);
				setRegistrationError(responseData.error || 'Registration failed. Please try again.');
			}
		} catch (error) {
			console.error('Registration error:', error);
			setRegistrationError('An error occurred. Please try again.');
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="form-group">
				<label htmlFor="register-display-name">Display name (this can be changed later)</label>
				<input
					{...register('displayName')}
					placeholder="Display Name"
					type="text"
					id='register-display-name'
					onChange={(e) => {
						register('displayName').onChange(e);
						registrationError && setRegistrationError(null);
					}}
				/>
				<span className="error-message">
					{errors.displayName?.message}
				</span>
			</div>

			<div className="form-group">
				<label htmlFor="register_username">Username (this can not be changed later)</label>
				<input
					{...register('username')}
					placeholder="Enter a username"
					type="text"
					id='register-username'
					onChange={(e) => {
						register('username').onChange(e);
						registrationError && setRegistrationError(null);
					}}
				/>
				<span className="error-message">
					{errors.username?.message}
				</span>
			</div>

			<div className="form-group">
				<label htmlFor="register-email">Email</label>
				<input
					{...register('email')}
					placeholder="Enter your email"
					type="email"
					id='register-email'
					onChange={(e) => {
						register('email').onChange(e);
						registrationError && setRegistrationError(null);
					}}
				/>
				<span className="error-message">
					{errors.email?.message}
				</span>
			</div>

			<div className="form-group">
				<label htmlFor="register-password">Password</label>
				<input
					{...register('password')}
					placeholder="Enter a password"
					type="password"
					id='register-password'
					onChange={(e) => {
						register('password').onChange(e);
						registrationError && setRegistrationError(null);
					}}
				/>
				<span className="error-message">
					{errors.password?.message}
				</span>
			</div>
			<div className="form-group">
				<label htmlFor="register-confirm-password">Confirm Password</label>
				<input
					{...register('confirmPassword')}
					placeholder="Confirm your password"
					type="password"
					id='register-confirm-password'
					onChange={(e) => {
						register('confirmPassword').onChange(e);
						registrationError && setRegistrationError(null);
					}}
				/>
				<span className="error-message">
					{errors.confirmPassword?.message}
				</span>
			</div>
			<div className="registration-error">
				{registrationError && <p className="error-message">{registrationError}</p>}
			</div>
			<div className="register-form-btns">
			<button className='register-form-btn register-submit-btn' type="submit">Register!</button>
			<button className='register-form-btn register-go-back-btn' type='button' onClick={handleGoBack}>Go Back</button>

			</div>
		</form>
	);
}

export default RegisterForm;