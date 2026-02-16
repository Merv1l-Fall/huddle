import { Timestamp } from "firebase-admin/firestore"

export interface User {
  id: string        // Firebase Auth UID
  displayName: string
  email: string
  photoURL?: string
  createdAt: Timestamp
  groupIds: string[]   // groups the user belongs to

}

// For registration - no id or createdAt yet
export type CreateUserInput = Omit<User, 'id' | 'createdAt'>

// For updates - everything optional
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt'>>

// For client-side (without sensitive data)
export type UserPublic = Omit<User, 'createdAt'>