'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterInput, registerSchema } from '@/lib/validation';
import './RegisterForm.css';

interface RegisterFormProps {
	onGoBackToggle: (value: boolean) => void;
}


const RegisterForm = ({ onGoBackToggle }: RegisterFormProps) => {

	const { register, handleSubmit, reset, formState: { errors } } = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		mode: "onBlur" //Might need to doubblechek UX
	});

	const handleGoBack = () => {
		reset();
		onGoBackToggle(false);
	}

	const onSubmit = async (data: RegisterInput) => {
		// Send to API
		const response = await fetch('/api/user/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
		// Handle response
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
				/>
				<span className="error-message">
					{errors.confirmPassword?.message}
				</span>
			</div>
			<div className="register-form-btns">
			<button className='register-form-btn register-submit-btn' type="submit">Register!</button>
			<button className='register-form-btn register-go-back-btn' type='button' onClick={handleGoBack}>Go Back</button>

			</div>
		</form>
	);
}

export default RegisterForm;