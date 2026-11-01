# Node.js and Express API Starter

A reusable starting point for Node.js and Express projects. It provides a small API foundation with a feature-oriented folder structure, MongoDB persistence through Mongoose, user registration and verification, and JWT-based sign-in and protected routes.

The project is intentionally small so it can be adapted: add your own domain models, routes, services, and tests as your application grows.

## What's included

- Express application and route composition
- User creation, email verification, and sign-in endpoints
- Password hashing and JWT creation/verification
- JWT authentication middleware for protected routes
- Mongoose models and transaction helper
- Zod request validation and centralized error handling
- Vitest and Supertest test setup
- Nodemailer-based verification email sender

## Project structure

```text
src/
  controllers/     Request handlers grouped by feature
  mailers/         Email composition and transport selection
  middleware/      Request parsing and authentication
  models/          Mongoose schemas and persistence helpers
  presenters/      API response shaping
  routers/         Express route definitions
  services/        Reusable application services
  app.js           Express app and error handling
  index.js         Database connection and server startup
tests/
  controllers/     Handler tests
  models/          Model tests
  routers/         HTTP/API tests
```

Keep related behavior in the appropriate feature area and extend the same structure when adding functionality.

## API routes

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/users` | Create a user |
| `POST` | `/api/v1/users/verification` | Generate and send a verification code |
| `PUT` | `/api/v1/users/verification/confirm` | Confirm a verification code |
| `POST` | `/api/v1/users/signin` | Sign in and receive a JWT |
| `GET` | `/api/v1` | Example protected route; requires the JWT returned by `/api/v1/users/signin` |

## Development setup

Requirements: Node.js 20.6 or newer and a MongoDB deployment that supports transactions (for example, a replica set).

Install dependencies:

```sh
npm install
```

Create a `.env` file at the project root and configure:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=your_database_name
SECRET_KEY=replace_with_a_long_random_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_AUTH_USER=your_smtp_username
SMTP_AUTH_PASS=your_smtp_password
SMTP_SENDER=no-reply@example.com
```

Keep `.env` and all secret values out of version control. The SMTP settings are used by the production mail transport.

Start the development server with automatic restarts:

```sh
npm run dev
```

The server uses port `3000` by default. Set `PORT` in the environment to use a different port. MongoDB must be available when the server starts.

## Tests

Run the test suite:

```sh
npm test
```

Generate coverage:

```sh
npm run test:coverage
```

Tests connect to the MongoDB database configured in `vitest.config.js`; that database must support transactions.

## Extending this starter

Use this repository as a foundation, not a finished production template. Before deploying a derived project, review its authentication and authorization requirements, configure and validate secrets and service connections, add rate limiting and operational logging, and test the important success and failure paths for its own features.
