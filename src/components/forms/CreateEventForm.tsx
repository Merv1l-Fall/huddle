'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEventInput, createEventSchema } from '@/lib/frontendValidation';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useDashboardStore, useGroupNavbarStore } from '@/lib/store/dashboardStore';
import './FormBase.css';
import './CreateEventForm.css';

interface CreateEventFormProps {
	// groupId: string;
	onGoBackToggle: (value: boolean) => void;
}

const CreateEventForm = ({ onGoBackToggle }: CreateEventFormProps) => {
	// const router = useRouter();
	const { user } = useAuthStore();
	const {activeGroupId } = useGroupNavbarStore();
	const { loadGroupDetails } = useDashboardStore();
	const [eventError, setEventError] = useState<string | null>(null);
	const [includeLocation, setIncludeLocation] = useState<boolean>(false);

	const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEventInput>({
		resolver: zodResolver(createEventSchema),
		mode: "onBlur"
	});

	const handleClose = () => {
		reset();
		setEventError(null);
		setIncludeLocation(false);
		onGoBackToggle(false);
	};

	const onSubmit = async (data: CreateEventInput) => {
		setEventError(null);

		if (!user) {
			setEventError('You must be logged in to create an event');
			return;
		}

		if (!includeLocation) {
			data.location = null;
		}

		try {
			const idToken = await user.getIdToken();
			const response = await fetch('/api/event/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${idToken}`
				},
				body: JSON.stringify({
					...data,
					groupId: activeGroupId
				}),
			});

			let responseData;
			try {
				responseData = await response.json();
			} catch (e) {
				setEventError('Server returned invalid response. Check that the API endpoint exists.');
				console.error('Failed to parse response:', e);
				return;
			}

			if (response.ok) {
				console.log('Event created successfully');
				reset();
				setEventError(null);
				// Reload group details to show new event
				if (activeGroupId) {
					const newIdToken = await user.getIdToken();
					await loadGroupDetails(activeGroupId, newIdToken);
				}
				onGoBackToggle(false);
			} else {
				console.error('Failed to create event:', responseData.error);
				setEventError(responseData.error || 'Failed to create event. Please try again.');
			}
		} catch (error) {
			console.error('Error creating event:', error);
			setEventError('An error occurred. Please try again.');
		}
	};

	return (
		<form className='create-event-form form-base' onSubmit={handleSubmit(onSubmit)}>
			{eventError && <span className="error-message" style={{ display: 'block', marginBottom: '1rem' }}>{eventError}</span>}

			<div className="form-group">
				<label htmlFor="create-event-title">Event Title</label>
				<input
					{...register('title')}
					placeholder="Enter event title"
					type="text"
					id="create-event-title"
					onChange={(e) => {
						register('title').onChange(e);
						eventError && setEventError(null);
					}}
				/>
				<span className="error-message">
					{errors.title?.message}
				</span>
			</div>

			<div className="form-group">
				<label htmlFor="create-event-description">Description (Optional)</label>
				<textarea
					{...register('description')}
					placeholder="Add a description for your event"
					id="create-event-description"
					onChange={(e) => {
						register('description').onChange(e);
						eventError && setEventError(null);
					}}
				/>
				<span className="error-message">
					{errors.description?.message}
				</span>
			</div>

			<div className="form-group">
				<label htmlFor="create-event-date">Event Date & Time</label>
				<input
					{...register('date')}
					type="datetime-local"
					id="create-event-date"
					onChange={(e) => {
						register('date').onChange(e);
						eventError && setEventError(null);
					}}
				/>
				<span className="error-message">
					{errors.date?.message}
				</span>
			</div>

			<div className="form-group location-toggle">
				<label htmlFor="include-location">
					<input
						type="checkbox"
						id="include-location"
						checked={includeLocation}
						onChange={(e) => setIncludeLocation(e.target.checked)}
					/>
					Add Location
				</label>
			</div>

			{includeLocation && (
				<>
					<div className="form-group">
						<label htmlFor="create-event-address">Address</label>
						<input
							{...register('location.address')}
							placeholder="Enter event address"
							type="text"
							id="create-event-address"
							onChange={(e) => {
								register('location.address').onChange(e);
								eventError && setEventError(null);
							}}
						/>
						<span className="error-message">
							{errors.location?.address?.message}
						</span>
					</div>

					<div className="form-group">
						<label htmlFor="create-event-city">City</label>
						<input
							{...register('location.city')}
							placeholder="Enter event city"
							type="text"
							id="create-event-city"
							onChange={(e) => {
								register('location.city').onChange(e);
								eventError && setEventError(null);
							}}
						/>
						<span className="error-message">
							{errors.location?.city?.message}
						</span>
					</div>
				</>
			)}

			<div className="form-buttons">
				<button type="submit" className="submit-btn">Create Event</button>
				<button type="button" onClick={handleClose} className="cancel-btn">Cancel</button>
			</div>
		</form>
	);
};

export default CreateEventForm;