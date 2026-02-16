import { z } from "zod";

export const registerSchema = z.object({
	displayName: z.string().min(1, 'Display name is required').max(25, 'Display name must be at most 25 characters'),
	email: z.email('Invalid email address').min(1, 'Email is required'),
	password: z.string().min(6, 'Password must be at least 6 characters').uppercase('Password must contain at least one uppercase letter').lowercase('Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
	username: z.string().min(5, 'Username must be at least 5 characters').max(20, 'Username must be at most 20 characters'),
	conformPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.conformPassword, {
	message: "Passwords don't match",
});

export type RegisterInput = z.infer<typeof registerSchema>;