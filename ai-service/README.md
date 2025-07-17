# AI Service

## Tech Stack

- [Node.js](https://nodejs.org/)
- [Mastra](https://github.com/mastra-ai/mastra)
- [Vercel AI SDK](https://github.com/vercel/ai)

## Setting up the project

First, clone the repository.

Then, navigate to the project directory:
```
cd ai-service
```

Install the dependencies:
```
pnpm install
```

Make sure you set the environment variables as found in `.env.example`.

Then, run the server:

```
pnpm run dev
```

## Running in Docker

Make sure the environment variables are set in the `.env` file.

Then, run the following command:

```
docker compose up --build
```

## Console

In the Console project, make sure you set:
```
PUBLIC_AI_SERVICE_BASE_URL=http://localhost:8889
```

Enjoy!