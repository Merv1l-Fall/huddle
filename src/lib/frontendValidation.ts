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

export type RegisterInput = z.infer<typeof registerSchema>;
export type SetupUserInput = z.infer<typeof setupUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;