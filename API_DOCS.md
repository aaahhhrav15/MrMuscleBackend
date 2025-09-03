# GymApp Backend API Documentation

This document provides a comprehensive reference for all API endpoints in the GymApp backend. It covers authentication, request/response formats, and usage examples for each route.

---

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```
Obtain a token via the `/auth/login-phone` and `/auth/verify-otp` endpoints.

---

## API Endpoints

### 1. Auth

#### POST `/auth/login-phone`
Request:
```json
{
  "phone": "+919876543210"
}
```
Response:
```json
{
  "ok": true,
  "ttl": 300
}
```

#### POST `/auth/verify-otp`
Request:
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```
Response:
```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "_id": "...",
    "name": "...",
    "phone": "+919876543210",
    "gymCode": "...",
    "gymId": "..."
  }
}
```

---

### 2. Users

#### GET `/users/me`
Returns the authenticated user's profile.

---

### 3. Gyms

#### GET `/gyms/fetch`
Returns the gym data for the authenticated user's `gymId`.

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "_id": "...",
  "address": {
    "city": "...",
    "country": "...",
    "state": "...",
    "street": "...",
    "zipCode": "..."
  },
  "contactInfo": {
    "email": "...",
    "phone": "..."
  },
  "facilities": [ ... ],
  "freeTrialCounter": 0,
  "gymCode": "...",
  "invoiceCounter": 0,
  "logo": null,
  "name": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### 4. Nutrition

#### GET `/nutrition/plan`
Returns the latest nutrition plan for the authenticated user.

#### GET `/nutrition/plans`
Returns all nutrition plans for the authenticated user.

---

### 5. Assigned Workouts

#### GET `/workouts/assigned/plan`
Returns the latest active assigned workout plan for the user.

#### GET `/workouts/assigned/plans`
Returns all assigned workout plans for the user. Query params: `status`, `limit`, `skip`.

#### GET `/workouts/assigned/week/:weekNumber`
Returns a specific week from the user's current assigned plan.

#### GET `/workouts/assigned/day/:weekNumber/:dayNumber`
Returns a specific day's exercises from the user's current assigned plan.

---

### 6. Accountability

#### GET `/accountability`
Returns the user's accountability posts. Query params: `limit`, `skip`.


#### POST `/accountability/s3`
Create a new accountability post with an S3 key.
Request:
```json
{
  "description": "...",
  "key": "s3/path/to/file.jpg"
}
```

#### DELETE `/accountability/:id`
Delete an accountability post by its ID (only the owner can delete).

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "message": "Accountability post deleted.",
  "s3Key": "s3/path/to/file.jpg"
}
```

---

### 7. Results

#### GET `/results`
Returns the user's results posts. Query params: `limit`, `skip`.


#### POST `/results/s3`
Create a new results post with an S3 URL.
Request:
```json
{
  "weight": 70,
  "description": "Progress update",
  "s3Key": "https://..."
}
```

#### DELETE `/results/:id`
Delete a result post by its ID (only the owner can delete).

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "message": "Result post deleted.",
  "s3Key": "s3/path/or/url/to/file.jpg"
}
```

---

### 8. Reels

#### GET `/reels`
Returns all reels.


#### POST `/reels/s3`
Create a new reel with an S3 key.
Request:
```json
{
  "caption": "...",
  "s3Key": "s3/path/to/video.mp4"
}
```

#### DELETE `/reels/:id`
Delete a reel by its ID (only the owner can delete).

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "message": "Reel deleted.",
  "s3Key": "s3/path/to/video.mp4"
}
```

---

### 9. Products

#### GET `/products`
Returns products for the logged-in customer.

---


### 10. S3


#### POST `/s3/presigned-url`
Generates a pre-signed S3 upload URL.
Request:
```json
{
  "folder": "uploads",
  "fileName": "file.jpg",
  "fileType": "image/jpeg"
}
```
Response:
```json
{
  "url": "https://...",
  "key": "uploads/file.jpg"
}
```

#### DELETE `/s3/delete`
Delete a file from S3 by its key.

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`

**Body:**
```json
{
  "key": "folder/filename.jpg"
}
```
**Response:**
```json
{
  "message": "File deleted successfully."
}
```

---

## Error Handling
All endpoints return errors in the following format:
```json
{
  "error": "Error message here"
}
```

---

## Notes
- All endpoints (except `/auth/*` and `/health`) require authentication.
- Use the `/health` endpoint to check server status.
- For all POST/PUT requests, use `Content-Type: application/json`.

---

For further details on data models or advanced usage, refer to the main project README.
