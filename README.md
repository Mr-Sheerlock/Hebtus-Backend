# Hebtus — Backend

Robust, production-ready backend for Hebtus (an Eventbrite-style event management platform).

![hebBE](https://user-images.githubusercontent.com/77818519/224427244-c2230677-43d1-47d2-8624-91f17db4f4d4.jpeg)

## About

Hebtus Backend is a Node.js + Express application powering a full event lifecycle: creation, ticketing, bookings, promotions, analytics and notifications. It demonstrates production concerns such as containerization, CI/CD, security hardening, stream-based file handling, and extensive automated tests.

## Key Features

- Advanced event management (public/private, drafts, scheduled publishing, geospatial search)
- Secure authentication & authorization (JWT, OAuth providers, email verification, secure password resets)
- Flexible ticketing (multiple ticket types, dynamic pricing, capacity management)
- Promo code engine with CSV bulk import and transactional safety
- Booking workflows supporting guest & registered users, QR code generation, and CSV export
- Creator analytics dashboard (gross/net sales, breakdowns, per-event metrics)
- Real-time notification queues and email delivery (Nodemailer / SendGrid)
- Stream-based file uploads to Cloudinary for scalable, stateless storage

## Tech Stack

- Runtime: Node.js 14+
- Framework: Express.js
- Database: MongoDB (Mongoose)
- Auth: Passport.js, JWT, bcrypt
- File Storage: Cloudinary
- Testing: Jest, Supertest
- CI/CD: Jenkins (Jenkinsfile included)
- Containerization: Docker + PM2

## Testing

- Tests are implemented with Jest and Supertest. The test suite covers authentication, events, bookings, promo codes, tickets, notifications, and creator analytics.
- Useful test helpers live under the `__test__/testutils` directory for seeding and authenticated flows.
