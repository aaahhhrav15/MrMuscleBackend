
# GymApp Backend

Production-ready Node.js/Express backend for gym management, supporting:
- User authentication (OTP-based)
- User profiles
- Gym data and multi-tenancy
- Nutrition plans
- Assigned workout plans
- Accountability and results tracking
- Reels and product management
- S3 file uploads (presigned URLs)

All APIs are JWT-secured and ready for integration with any frontend (mobile/web).

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Seed Nutrition Data](#seed-nutrition-data)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Health](#health)
  - [Auth (existing)](#auth-existing)
  - [Users (existing)](#users-existing)
  - [Nutrition](#nutrition)
- [cURL Examples](#curl-examples)
- [Data Model](#data-model)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [License](#license)

---


## Features
- JWT-secured routes using your existing auth middleware
- Nutrition Plans (latest and all for user)
- Assigned Workout Plans (active, all, by week/day)
- Gym data fetch by user gymId
- Accountability and Results posts (with S3 support)
- Reels and Products endpoints
- S3 presigned URL generation for uploads
- Can be tested fully from the terminal with `curl` or Node CLI

---

## Tech Stack
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **dotenv** for config
- **morgan** for logging

---

gym-api/

## Project Structure
```
gym-api/
├─ server.js                 # App entrypoint
├─ .env.example              # Environment variable template
├─ API_DOCS.md               # Full API documentation (see below)
├─ src/
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ users.js
│  │  ├─ gyms.js
│  │  ├─ nutrition.js
│  │  ├─ assignedWorkouts.js
│  │  ├─ accountability.js
│  │  ├─ results.js
│  │  ├─ reels.js
│  │  ├─ products.js
│  │  └─ s3.js
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Gym.js
│  │  ├─ nutritionPlans.js
│  │  ├─ AssignedWorkoutPlans.js
│  │  ├─ Accountability.js
│  │  ├─ Result.js
│  │  ├─ Reels.js
│  │  └─ Product.js
│  └─ middleware/
│     └─ auth.js
└─ scripts/
  └─ seedNutrition.js
```

---

## Prerequisites
- Node.js v18+ recommended
- MongoDB running locally or an Atlas cluster
- npm or yarn

---

## API Reference

See [`API_DOCS.md`](./API_DOCS.md) for a complete, up-to-date list of all endpoints, request/response formats, and usage examples for:
- Auth (login, OTP verification)
- Users (profile)
- Gyms (fetch by user gymId)
- Nutrition (latest/all plans)
- Assigned Workouts (plan, week, day)
- Accountability (list, post)
- Results (list, post)
- Reels (list, post)
- Products (list)
- S3 (presigned upload URL)

---