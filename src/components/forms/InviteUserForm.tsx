'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InviteToGroupInput, inviteToGroupSchema } from '@/lib/frontendValidation';
import { useAuthStore } from '@/lib/store/authStore';
import { useGroupNavbarStore } from '@/lib/store/dashboardStore';
import './FormBase.css';
import './InviteUserForm.css';

interface InviteUserFormProps {
	onGoBackToggle: (value: boolean) => void;
}

interface InviteCandidate {
	id: string;
	username: string;
}

const InviteUserForm = ({ onGoBackToggle }: InviteUserFormProps) => {
	const { user } = useAuthStore();
	const { activeGroupId } = useGroupNavbarStore();
	const [inviteError, setInviteError] = useState<string | null>(null);
	const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
	const [searchResults, setSearchResults] = useState<InviteCandidate[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<InviteToGroupInput>({
		resolver: zodResolver(inviteToGroupSchema),
		mode: 'onBlur',
		defaultValues: {
			username: '',
		},
	});

	const usernameField = register('username');
	const usernameValue = watch('username');

	const handleClose = () => {
		reset();
		setInviteError(null);
		setInviteSuccess(null);
		setSearchResults([]);
		onGoBackToggle(false);
	};

	useEffect(() => {
		const trimmedUsername = usernameValue?.trim() || '';

		if (!trimmedUsername || !user || !activeGroupId) {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}

		let isCancelled = false;

		const timeoutId = setTimeout(async () => {
			setIsSearching(true);

			try {
				const idToken = await user.getIdToken();
				const response = await fetch(
					`/api/group/invite/search?groupId=${encodeURIComponent(activeGroupId)}&query=${encodeURIComponent(trimmedUsername)}`,
					{
						method: 'GET',
						headers: {
							Authorization: `Bearer ${idToken}`,
						},
					},
				);

				const responseData = await response.json().catch(() => null);

				if (!isCancelled) {
					if (response.ok) {
						setSearchResults(responseData?.candidates || []);
					} else {
						setSearchResults([]);
					}
				}
			} catch (error) {
				if (!isCancelled) {
					setSearchResults([]);
				}
				console.error('Error searching users:', error);
			} finally {
				if (!isCancelled) {
					setIsSearching(false);
				}
			}
		}, 200);

		return () => {
			isCancelled = true;
			clearTimeout(timeoutId);
		};
	}, [usernameValue, user, activeGroupId]);

	const onSubmit = async (data: InviteToGroupInput) => {
		setInviteError(null);
		setInviteSuccess(null);

		if (!user) {
			setInviteError('You must be logged in to invite users');
			return;
		}

		if (!activeGroupId) {
			setInviteError('Select a group before inviting users');
			return;
		}

		try {
			const idToken = await user.getIdToken();
			const response = await fetch('/api/group/invite/send', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${idToken}`,
				},
				body: JSON.stringify({
					groupId: activeGroupId,
					username: data.username.trim(),
				}),
			});

			const responseData = await response.json().catch(() => null);

			if (response.ok) {
				setInviteSuccess(`Invite sent to @${data.username.trim()}`);
				setSearchResults([]);
				reset({ username: '' });
			} else {
				setInviteError(responseData?.error || 'Failed to send invite. Please try again.');
			}
		} catch (error) {
			console.error('Error inviting user:', error);
			setInviteError('An error occurred. Please try again.');
		}
	};

	return (
		<form className='invite-user-form form-base' onSubmit={handleSubmit(onSubmit)}>
			<h2>Invite a friend to the group</h2>
			{inviteError && <span className='error-message invite-message'>{inviteError}</span>}
			{inviteSuccess && <span className='success-message invite-message'>{inviteSuccess}</span>}

			<div className='form-group'>
				<label htmlFor='invite-username'>Search Username</label>
				<input
					{...usernameField}
					type='text'
					id='invite-username'
					placeholder='Type a username...'
					onChange={(e) => {
						usernameField.onChange(e);
						inviteError && setInviteError(null);
						inviteSuccess && setInviteSuccess(null);
					}}
				/>
				<span className='error-message'>{errors.username?.message}</span>

				{isSearching && <span className='search-hint'>Searching...</span>}

				{!isSearching && usernameValue?.trim() && searchResults.length === 0 && (
					<span className='search-hint'>No available users found</span>
				)}

				{searchResults.length > 0 && (
					<div className='invite-search-results'>
						{searchResults.map((candidate) => (
							<button
								key={candidate.id}
								type='button'
								className='invite-search-result-item'
								onClick={() => {
									setValue('username', candidate.username, { shouldDirty: true, shouldValidate: true });
									setSearchResults([]);
								}}
							>
								@{candidate.username}
							</button>
						))}
					</div>
				)}
			</div>

			<div className='form-buttons'>
				<button type='submit' className='submit-btn'>
					Send Invite
				</button>
				<button type='button' onClick={handleClose} className='cancel-btn'>
					Cancel
				</button>
			</div>
		</form>
	);
};

export default InviteUserForm;
