import { z } from "zod";

export const registerSchema = z.object({
	displayName: z.string().min(1, 'Display name is required').max(20, 'Display name can\'t be more than 20 characters'),
	email: z.email('Invalid email address').min(1, 'Email is required'),
	password: z.string().min(6, 'Password must be at least 6 characters').uppercase('Password must contain at least one uppercase letter').lowercase('Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
	username: z.string().min(5, "Username must be at least 5 characters").max(20, 'Username can\'t be more than 20 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
	confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
});

export const setupUserSchema = z.object({
	username: z.string().min(1, "Username is required").max(20, "Username can\'t be more than 20 characters").regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
	confirmUsername: z.string().min(1, 'Confirm username is required'),
}).refine((data) => data.username === data.confirmUsername, {
	message: "Usernames don't match",
})

export const loginSchema = z.object({
	email: z.email('Invalid email address').min(1, 'Email is required'),
	password: z.string().min(1, 'Password is required'),
});

export const createGroupSchema = z.object({
	name: z.string().min(1, "Group name is required").max(20, "Group name can't be more than 20 characters"),
	description: z.string().max(100, "Description can't be more than 100 characters").optional().or(z.literal('')),
});

export const createEventSchema = z.object({
	title: z.string().min(1, "Event title is required").max(50, "Event title can't be more than 50 characters"),
	description: z.string().max(200, "Description can't be more than 200 characters").optional().or(z.literal('')),
	groupId: z.string().min(1, "Group ID is required"),
	date: z.coerce.date({ message: "Invalid date format" }),
	hasLocation: z.boolean(),
	location: z.object({
		address: z.string().min(1, "Address is required"),
		city: z.string().min(1, "City is required"),
	}).optional(),
});

export const groupDetailSchema = z.object({
	group: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string(),
		createdBy: z.string(),
		memberIds: z.array(z.string()),
		invitedUsers: z.array(z.string()),
		adminIds: z.array(z.string()),
		createdAt: z.coerce.date(),
		photoURL: z.string().nullable().optional(),
		groupColor: z.string(),
	}),
	events: z.array(z.object({
		id: z.string(),
		groupId: z.string(),
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		createdBy: z.string(),
		attendees: z.record(z.string(), z.enum(['yes', 'no', 'pending'])),
		location: z.object({
			address: z.string(),
			city: z.string(),
			lat: z.number(),
			lng: z.number(),
		}).optional(),
	})),
	userAttendanceStatus: z.record(z.string(), z.enum(['yes', 'no', 'pending'])),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SetupUserInput = z.infer<typeof setupUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type GroupDetailResponse = z.infer<typeof groupDetailSchema>;