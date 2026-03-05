# Huddle

**The Social Planner**

A web application designed to simplify event coordination within friend groups. Instead of relying on scattered messages across chat platforms, Huddle provides a structured space where users can create groups, schedule events, and manage attendance in one place.

## Overview

Social planning in friend groups is often handled through general communication platforms such as group chats or Discord servers. While effective for communication, these platforms lack structure when organizing social events. Important information such as time, location, and attendance often becomes scattered across multiple messages, making it difficult for all members to stay informed.

Huddle addresses this problem by providing a dedicated platform that focuses exclusively on friend groups and their social activities. The application prioritizes simplicity and usability for small-scale social planning rather than commercial or public events.

## Features

- **User Authentication**: Secure login with Google OAuth or email/password
- **Group Management**: Create and join private groups
- **Event Creation**: Schedule events with title, description, time, date, and location
- **Attendance Tracking**: Confirm participation with just two clicks after logging in
- **Real-time Updates**: Event information synchronized across all group members
- **Intuitive UI**: Familiar sidebar navigation with streamlined event management

## Tech Stack

### Frontend
- **Next.js** - Fullstack React framework
- **TypeScript** - Type-safe development
- **React Hook Form** - Form handling and validation
- **Zustand** - State management

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **Firebase Authentication** - User authentication and token management
- **Firebase Admin SDK** - Server-side token verification
- **Firestore** - NoSQL document database

### Validation & Security
- **Zod** - Schema validation for both client and server
- **Token-based Authorization** - Secure API route protection

## Project Structure

```
huddle/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # Backend API routes
│   │   │   ├── dashboard/     # Dashboard data endpoints
│   │   │   ├── event/         # Event CRUD operations
│   │   │   ├── group/         # Group management
│   │   │   └── user/          # User operations
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── setup/             # User setup page
│   ├── components/            # React components
│   │   ├── forms/            # Form components
│   │   └── ui/               # Reusable UI components
│   └── lib/                   # Utilities and configuration
│       ├── auth.ts           # Authentication logic
│       ├── firebase-admin.ts # Firebase Admin SDK setup
│       ├── firebase-client.ts # Firebase Client SDK setup
│       ├── validation.ts     # Zod schemas
│       └── store/            # Zustand stores
└── public/                    # Static assets
```

## Data Model

The application uses three core entities stored in Firestore:

### Users
- Username
- Email (via Firebase Authentication)
- Group memberships

### Groups
- Group name
- Creator reference
- Member list
- Associated events

### Events
- Title and description
- Time, date, and location
- Creator reference
- Confirmed participants
- Parent group reference

## Architecture

### Authentication Flow
1. User logs in via Firebase Authentication (Google or email/password)
2. Firebase Client SDK generates an ID token
3. Token is included in subsequent API requests via Authorization header
4. Server-side verification using Firebase Admin SDK's `verifyIdToken()`
5. Only authenticated requests can access protected routes

### Application Flow
1. **Login/Register**: User authenticates via Firebase
2. **Group Management**: User creates or joins groups
3. **Event Creation**: User creates events within groups
4. **Attendance Management**: Group members respond to events
5. **Real-time Updates**: All changes synchronized via Firestore

### API Structure

RESTful API organized around core entities:

- **GET** - Retrieve data (groups, events, user data)
- **POST** - Create resources (groups, events)
- **PATCH** - Update data (attendance status)
- **DELETE** - Remove resources (expired events)

All protected routes require valid Firebase ID tokens and validate request data using Zod schemas before database operations.

## Security

- **Client-side Authentication**: Firebase Authentication SDK
- **Server-side Verification**: Firebase Admin SDK token verification
- **Schema Validation**: Zod validation on all API endpoints
- **Protected Routes**: Token-based authorization for all sensitive operations
- **Database Security**: All database operations performed server-side

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd huddle
```

2. Install dependencies
```bash
npm install
```

3. Set up Firebase configuration
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firebase Authentication (Google and Email/Password providers)
   - Create a Firestore database
   - Add your Firebase configuration to environment variables

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## State Management

The application uses Zustand stores for centralized state management:

- **authStore**: User authentication state and Firebase auth listeners
- **dashboardStore**: Group details, event details, and popup visibility
- **popupStore**: Modal dialog state management

## Future Development

Planned enhancements include:

- **Map Integration**: Visual location display for events
- **Profile Pictures**: Custom profile pictures for email/password users
- **Display Name Editing**: Allow users to change their display name
- **Notifications**: Real-time event notifications
- **Group Chat**: In-group messaging feature
- **UI Improvements**: Bug fixes and polished interface

## Lessons Learned

Key takeaways from development:

- **Backend Security First**: Investing time in authentication and authorization early creates a robust foundation
- **Fullstack Efficiency**: Next.js simplifies deployment and routing by combining frontend and backend
- **Validation Consistency**: Using Zod for both client and server validation reduces friction
- **Modular Architecture**: Component-based design and clear API structure improve maintainability

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Auth - Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Zod - TypeScript Schema Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/get-started)
- [Zustand State Management](https://zustand.docs.pmnd.rs/learn/getting-started/introduction)

## License

This project was developed as part of FED24 coursework.

---

**Author**: Vilmer Fall  
**Date**: March 2026
