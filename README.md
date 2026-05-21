# MRT Backend

Express + TypeScript backend for the MRT Jakarta clone project.

## Overview

This backend service provides the API for the MRT ticketing experience, including:
- Authentication and user management
- Station and schedule lookup
- Ticket purchase flow
- Voucher validation
- Transaction and activity tracking
- Payment integration via Xendit
- Content pages for help, FAQ and policies

The backend is built with:
- Node.js
- TypeScript
- Express
- MongoDB / Mongoose
- JWT authentication
- Awilix dependency injection
- Swagger API documentation

## Features

- `POST /api/v1/auth` for registration, login, and PIN flows
- `GET /api/v1/stations` and `GET /api/v1/schedules` for route data
- `POST /api/v1/tickets` to create ticket orders
- `POST /api/v1/payments` to create Xendit invoices
- Webhook callback handling for payment status updates
- Voucher, transaction, activity, notification, and profile content support

## Getting Started

### Prerequisites

- Node.js 18+ or later
- npm
- MongoDB instance

### Install

```bash
cd mrt_backend
npm install
```

### Environment

Create a `.env` file in `mrt_backend` with at least the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/mrt_clone
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
XENDIT_SECRET_KEY=your_xendit_secret_key
XENDIT_WEBHOOK_TOKEN=your_xendit_webhook_token
```

### Run in development

```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.

### Build and run production

```bash
npm run build
npm start
```

### Seed initial data

To populate the database with station, schedule, and voucher sample data:

```bash
npx ts-node src/seeder.ts
```

## API Documentation

Once the server is running, open:

- `http://localhost:5000/api-docs`

This serves the Swagger UI for the available endpoints.

## Important Notes

- The backend exposes a health check at `/health`.
- The API base path is `/api/v1`.
- Payment flow uses Xendit invoices and stores invoice metadata in transactions.
- The frontend uses an emulator-friendly backend URL by default (`http://10.0.2.2:5000/api/v1`).

## Project Structure

- `src/app.ts`: application setup and route registration
- `src/server.ts`: server startup and DB connection
- `src/config`: database, Swagger, and DI container configuration
- `src/modules`: feature modules grouped by domain
- `src/models`: Mongoose data models
- `src/utils`: shared utilities and error handling
- `src/seeder.ts`: sample data seeding script

## Route Groups

- `auth`
- `users`
- `stations`
- `schedules`
- `tickets`
- `payments`
- `content`
- `vouchers`
- `transactions`

## Integration

When connecting the Flutter frontend to this backend, ensure the frontend's `ApiConfig.baseUrl` points to the running backend instance.
