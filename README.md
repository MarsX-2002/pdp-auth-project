# PDP Authentication System

A secure authentication system built with Next.js and Express.js.

## Project Structure
```
pdp-auth/
├── frontend/         # Next.js application
├── backend/          # Express.js server
└── README.md        # Project documentation
```

## Features
- User registration and login
- JWT-based authentication with access and refresh tokens
- Protected routes
- Secure password handling
- HTTP-only cookie for refresh tokens
- Token refresh mechanism
- Form validation
- Error handling

## Tech Stack
- Frontend: Next.js, React
- Backend: Express.js, Node.js
- Database: MongoDB
- Authentication: JWT, bcrypt
- Other: TypeScript, cookies-js

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- MongoDB

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd pdp-auth
```

2. Install dependencies and start backend
```bash
cd backend
npm install
npm run dev
```

3. Install dependencies and start frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Security Features
- Password hashing using bcrypt
- HTTP-only cookies for refresh tokens
- CSRF protection
- Rate limiting on authentication endpoints
- Secure session handling
