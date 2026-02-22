import { Timestamp } from "firebase-admin/firestore"

export interface User {
  id: string        // Firebase Auth UID
  displayName: string
  email: string
  photoURL?: string
  createdAt: Timestamp
  groupIds: string[]   // groups the user belongs to

}

export interface Group {
	id: string;
	name: string;
	description: string;
	createdBy: string;
	memberIds: string[];
	invitedUsers: string[];
	adminIds: string[];
	createdAt: Date;
	photoURL?: string;
}

export interface Event {
	id: string;
	groupId: string;
	title: string;
	description: string;
	date: Date;
	createdBy: string;
	invitedUsers: string[];
	attendees: Record<string, 'yes' | 'no' | 'pending'>;
	createdAt: Date;
	location?: {
		address: string;
		city: string;
		lat: number;
		lng: number;
	};
}

export interface GroupDetailResponse {
  group: {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    memberIds: string[];
    invitedUsers: string[];
    adminIds: string[];
    createdAt: Date;
    photoURL?: string;
  };
  events: {
    id: string;
    title: string;
    description: string;
    date: Date;
    createdBy: string;
    invitedUsers: string[];
    attendees: Record<string, 'yes' | 'no' | 'pending'>;
    location?: {
	  address: string;
	  city: string;
	  lat?: number;
	  lng?: number;
	};
  }[];
  userAttendanceStatus: Record<string, 'yes' | 'no' | 'pending'>; // For all events in this group
}

// For registration - no id or createdAt yet
export type CreateUserInput = Omit<User, 'id' | 'createdAt'>

// For updates - everything optional
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt'>>

// For client-side (without sensitive data)
export type UserPublic = Omit<User, 'createdAt'>