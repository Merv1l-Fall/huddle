"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateEventInput, createEventSchema } from "@/lib/frontendValidation";
import { useAuthStore } from "@/lib/store/authStore";
import { useGroupNavbarStore } from "@/lib/store/dashboardStore";
import { useRouter } from "next/navigation";
import "./CreateEventForm.css";

interface CreateEventFormProps {
	onGoBackToggle: (value: boolean) => void;
	groupId?: string;
}

const CreateEventForm = ({ onGoBackToggle, groupId }: CreateEventFormProps) => {
	const router = useRouter();
	const { user } = useAuthStore();
	const activeGroupId = useGroupNavbarStore((state) => state.activeGroupId);
	const [eventError, setEventError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CreateEventInput>({
		resolver: zodResolver(createEventSchema),
		mode: "onBlur",
		defaultValues: {
			groupId: groupId ?? activeGroupId ?? "",
			hasLocation: true,
		},
	});

	const hasLocation = watch("hasLocation");

	const dateRegister = register("date", { valueAsDate: true });

	useEffect(() => {
		if (!groupId) {
			setValue("groupId", activeGroupId ?? "");
		}
	}, [activeGroupId, groupId, setValue]);

	const handleClose = () => {
		reset();
		setEventError(null);
		onGoBackToggle(false);
	};

	const onSubmit = async (data: CreateEventInput) => {
		setEventError(null);

		if (!user) {
			setEventError("You must be logged in to create an event");
			return;
		}

		const finalGroupId = groupId ?? activeGroupId ?? data.groupId;
		if (!finalGroupId) {
			setEventError("Group is required to create an event");
			return;
		}

		const payload: CreateEventInput = {
			...data,
			groupId: finalGroupId,
			description: data.description || "",
			...(data.hasLocation ? { location: data.location } : { location: undefined }),
		};

		try {
			const idToken = await user.getIdToken();
			const response = await fetch("/api/event/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${idToken}`,
				},
				body: JSON.stringify(payload),
			});

			const responseData = await response.json();

			if (response.ok) {
				reset();
				setEventError(null);
				router.refresh();
				onGoBackToggle(false);
			} else {
				setEventError(responseData.error || "Failed to create event. Please try again.");
			}
		} catch (error) {
			console.error("Error creating event:", error);
			setEventError("An error occurred. Please try again.");
		}
	};

	return (
		<form className="create-event-form" onSubmit={handleSubmit(onSubmit)}>
			{eventError && (
				<span className="error-message" style={{ display: "block", marginBottom: "1rem" }}>
					{eventError}
				</span>
			)}

			<div className="form-group">
				<label htmlFor="create-event-title">Event Title</label>
				<input
					{...register("title")}
					placeholder="Enter event title"
					type="text"
					id="create-event-title"
					onChange={(e) => {
						register("title").onChange(e);
						eventError && setEventError(null);
					}}
				/>
				<span className="error-message">{errors.title?.message}</span>
			</div>

			<div className="form-group">
				<label htmlFor="create-event-description">Description (Optional)</label>
				<textarea
					{...register("description")}
					placeholder="Add a description for your event"
					id="create-event-description"
					onChange={(e) => {
						register("description").onChange(e);
						eventError && setEventError(null);
					}}
				/>
				<span className="error-message">{errors.description?.message}</span>
			</div>

			<div className="form-group">
				<label htmlFor="create-event-date">Date</label>
				<input
					{...dateRegister}
					type="date"
					id="create-event-date"
					onChange={(e) => {
						dateRegister.onChange(e);
						eventError && setEventError(null);
					}}
				/>
				<span className="error-message">{errors.date?.message}</span>
			</div>

			<div className="form-group">
				<label className="checkbox-label" htmlFor="create-event-has-location">
					<input
						{...register("hasLocation")}
						id="create-event-has-location"
						type="checkbox"
						defaultChecked
						onChange={(e) => {
							register("hasLocation").onChange(e);
							eventError && setEventError(null);
						}}
					/>
					Event has a physical location
				</label>
			</div>

			{!groupId && (
				<div className="form-group">
					<label htmlFor="create-event-group-id">Group ID</label>
					<input
						{...register("groupId")}
						placeholder="Enter group ID"
						type="text"
						id="create-event-group-id"
						onChange={(e) => {
							register("groupId").onChange(e);
							eventError && setEventError(null);
						}}
					/>
					<span className="error-message">{errors.groupId?.message}</span>
				</div>
			)}

			{hasLocation && (
				<>
					<div className="form-group">
						<label htmlFor="create-event-address">Address</label>
						<input
							{...register("location.address")}
							placeholder="Enter address"
							type="text"
							id="create-event-address"
							onChange={(e) => {
								register("location.address").onChange(e);
								eventError && setEventError(null);
							}}
						/>
						<span className="error-message">{errors.location?.address?.message}</span>
					</div>

					<div className="form-group">
						<label htmlFor="create-event-city">City</label>
						<input
							{...register("location.city")}
							placeholder="Enter city"
							type="text"
							id="create-event-city"
							onChange={(e) => {
								register("location.city").onChange(e);
								eventError && setEventError(null);
							}}
						/>
						<span className="error-message">{errors.location?.city?.message}</span>
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
