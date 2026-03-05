'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateGroupInput, createGroupSchema } from '@/lib/frontendValidation';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useGroupNavbarStore } from '@/lib/store/dashboardStore';
import './FormBase.css';
import './CreateGroupForm.css';

interface CreateGroupFormProps {
	onGoBackToggle: (value: boolean) => void;
}

const CreateGroupForm = ({ onGoBackToggle }: CreateGroupFormProps) => {
	const router = useRouter();
	const { user } = useAuthStore();
	const { loadGroups } = useGroupNavbarStore();
	const [groupError, setGroupError] = useState<string | null>(null);

	const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateGroupInput>({
		resolver: zodResolver(createGroupSchema),
		mode: "onBlur"
	});

	const handleClose = () => {
		reset();
		setGroupError(null);
		onGoBackToggle(false);
	};

	const onSubmit = async (data: CreateGroupInput) => {
		setGroupError(null);

		if (!user) {
			setGroupError('You must be logged in to create a group');
			return;
		}

		try {
			const idToken = await user.getIdToken();
			const response = await fetch('/api/group/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${idToken}`
				},
				body: JSON.stringify(data),
			});

			const responseData = await response.json();

			if (response.ok) {
				console.log('Group created successfully');
				
				// Reload groups to update the navbar
				await loadGroups(idToken);
				
				reset();
				setGroupError(null);
				router.refresh();
				onGoBackToggle(false);
			} else {
				console.error('Failed to create group:', responseData.error);
				setGroupError(responseData.error || 'Failed to create group. Please try again.');
			}
		} catch (error) {
			console.error('Error creating group:', error);
			setGroupError('An error occurred. Please try again.');
		}
	};

	return (
		<form className='create-group-form form-base' onSubmit={handleSubmit(onSubmit)}>
			{groupError && <span className="error-message" style={{ display: 'block', marginBottom: '1rem' }}>{groupError}</span>}

			<div className="form-group">
				<label htmlFor="create-group-name">Group Name</label>
				<input
					{...register('name')}
					placeholder="Enter group name"
					type="text"
					id="create-group-name"
					onChange={(e) => {
						register('name').onChange(e);
						groupError && setGroupError(null);
					}}
				/>
				<span className="error-message">
					{errors.name?.message}
				</span>
			</div>

			<div className="form-group">
				<label htmlFor="create-group-description">Description (Optional)</label>
				<textarea
					{...register('description')}
					placeholder="Add a description for your group"
					id="create-group-description"
					onChange={(e) => {
						register('description').onChange(e);
						groupError && setGroupError(null);
					}}
				/>
				<span className="error-message">
					{errors.description?.message}
				</span>
			</div>

			<div className="form-buttons">
				<button type="submit" className="submit-btn">Create Group</button>
				<button type="button" onClick={handleClose} className="cancel-btn">Cancel</button>
			</div>
		</form>
	);
};

export default CreateGroupForm;
