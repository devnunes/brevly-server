# Brevly Server

## About

This project is a challenge for my post-graduation course and will be part of my final grade. It is a URL shortening service built with Node.js, TypeScript, Fastify, and Drizzle ORM, following best practices for backend development.

## Features

- Shorten long URLs to custom short URLs
- Retrieve all shortened links
- Get link details by short URL
- Delete links
- Export all links as a CSV report

## Tech Stack

- Node.js & TypeScript
- Fastify (API framework)
- Drizzle ORM (database)
- PostgreSQL (database)
- Zod (validation)
- Cloudflare R2 (object storage)

## Running Locally

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Configure environment variables in `.env` (see `src/env.ts` for required variables)
4. Start the server: `pnpm dev` or `pnpm start`

## API Endpoints

- `POST /links` — Create a new shortened link
- `GET /links` — List all links
- `GET /link/:shortUrl` — Get link by short URL
- `DELETE /link` — Delete a link (by ID)
- `POST /links/export` — Export all links as CSV

API documentation is available at `/docs` when the server is running.

## Testing

Run tests with `pnpm test`.

## Notes

This project was developed as part of an academic challenge and can be expanded to include authentication, analytics, and other features.

## License

This project is for educational purposes only.

---

Developed by Matheus Nunes — Post-graduation in Web Development