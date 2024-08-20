
# Payment Service API

This application is an API service for managing payments using Node.js with Fastify as the framework, PostgreSQL as the database, and Supabase as the authentication service. The application also includes API documentation using Swagger.

## Tech Stack

- **Node.js** with **Fastify** as the web framework
- **PostgreSQL** as the database
- **Prisma** as the ORM
- **Supabase** for authentication
- **Swagger** for API documentation

## Requirements

Ensure you have the following software installed on your system:

- **Docker** and **Docker Compose**
- **Node.js** (if running without Docker)
- **npm** (if running without Docker)

## Environment Configuration

Create a `.env` file in your project's root directory with the following format, or adjust it according to your needs:

```env
DATABASE_URL="postgres://user:password@db:5432/payment"
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

## Running the Application with Docker

You can run this application using Docker to simplify the setup process and run all services with a single command.

1. **Build and Run the Containers:**

   Run the following command to build the image and start the containers:

   ```bash
   docker-compose up --build
   ```

   This command will:
   - Build the Docker image for the Node.js application.
   - Start the PostgreSQL service.
   - Run Prisma migrations.
   - Start the application on port `3000`.

2. **Stop and Remove the Containers:**

   To stop and remove the running containers, run the following command:

   ```bash
   docker-compose down
   ```

## Running the Application Without Docker

If you want to run the application without Docker, ensure PostgreSQL is installed and configured correctly. Follow these steps:

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Run Prisma Migrations:**

   ```bash
   npx prisma migrate deploy
   ```

3. **Start the Application:**

   ```bash
   npm start / npm run dev
   ```

The application will run at `http://localhost:3000`.

## API Documentation

API documentation can be accessed via Swagger at the following endpoint:

```
http://localhost:3000/docs
```
