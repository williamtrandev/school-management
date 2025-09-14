# API Configuration Guide

## Environment Setup

### 1. Create Environment File
Create a `.env` file in the root directory with the following content:

```env
VITE_API_URL=http://localhost:8000/api
```

### 2. API Endpoints
The application expects the following API endpoints:

#### Authentication
- `POST /auth/auth/login` - User login
- `POST /auth/auth/logout` - User logout  
- `POST /auth/auth/refresh` - Refresh access token
- `GET /auth/auth/profile` - Get user profile

#### Users Management
- `GET /users` - List users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Students Management
- `GET /students` - List students
- `GET /students/:id` - Get student details
- `POST /students` - Create student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

#### Teachers Management
- `GET /teachers` - List teachers
- `GET /teachers/:id` - Get teacher details
- `POST /teachers` - Create teacher
- `PUT /teachers/:id` - Update teacher
- `DELETE /teachers/:id` - Delete teacher

#### Classes Management
- `GET /classes` - List classes
- `GET /classes/:id` - Get class details
- `POST /classes` - Create class
- `PUT /classes/:id` - Update class
- `DELETE /classes/:id` - Delete class

#### Rankings
- `GET /rankings` - List rankings
- `GET /rankings/weekly` - Weekly rankings
- `GET /rankings/monthly` - Monthly rankings

## API Response Format

### Login Response
```json
{
  "access_token": "string",
  "refresh_token": "string", 
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@school.edu.vn",
    "role": "admin",
    "name": "Admin User"
  }
}
```

### Error Response
```json
{
  "detail": "Invalid credentials"
}
```

## Authentication Flow

1. User submits login form with username/password
2. Frontend calls `POST /auth/auth/login`
3. API returns access_token and refresh_token
4. Frontend stores tokens in localStorage
5. All subsequent API calls include `Authorization: Bearer <token>` header
6. When token expires, frontend uses refresh_token to get new access_token

## Demo Accounts

For testing purposes, you can use these demo accounts:

- **Admin**: `admin` / `password123`
- **Teacher**: `teacher1` / `password123`  
- **Student**: `student1` / `password123`

## Development

### Local Development
```bash
# Start the frontend
npm run dev

# The app will be available at http://localhost:8080
```

### API Server
Make sure your API server is running at `http://localhost:8000` before testing the application.

## Production Deployment

For production, update the `VITE_API_URL` in your environment file:

```env
VITE_API_URL=https://your-api-domain.com/api
``` 