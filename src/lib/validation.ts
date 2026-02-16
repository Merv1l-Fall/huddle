import { z } from 'zod';

export const registerSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(25, 'Display name must be at most 25 characters'),
  email: z.email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(5, 'Username must be at least 5 characters').max(20, 'Username must be at most 20 characters'),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createGroupSchema = z.object({
	name: z.string().min(1, "Group name is required").max(20, "group name cant be more than 20 characters"),
	description: z.string().max(100, "Description cant be more than 100 characteres").optional(),
})

export const leaveGroupSchema = z.object({
	groupId: z.string().min(1, "Group ID is required")
})

export const setupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
});

//export types if needed later
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type LeaveGroupInput = z.infer<typeof leaveGroupSchema>;
export type SetupInput = z.infer<typeof setupSchema>;