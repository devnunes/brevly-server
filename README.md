# Brevly Server

A Fastify-based API for the Brevly URL shortening service, using PostgreSQL and Drizzle ORM.

## Features

- Create, delete, and list shortened links
- Retrieve original URL from a short URL
- Increment access count for links
- Export links as CSV (with CDN support planned)
- OpenAPI (Swagger) documentation at `/docs`

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL

### Setup

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in your environment variables.
3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Run database migrations:

   ```bash
   pnpm db:migrate
   ```

5. Start the server:

   ```bash
   pnpm dev
   ```

The server will run at `http://localhost:3333` by default.

### Testing

```bash
pnpm test
```

## API Documentation

Visit [http://localhost:3333/docs](http://localhost:3333/docs) for Swagger UI.

## Project Structure

- `src/infra/http/` - HTTP server and routes
- `src/infra/db/` - Database schemas and migrations

## License

ISC

