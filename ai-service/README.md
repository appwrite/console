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
bun install
```

Make sure you set the environment variables as found in `.env.example`.

Then, run the server:

```
bun run dev
```

## Setting up Open Runtime

Create a new empty directory for the workspace and take note of its path:

```
cd ai-service
mkdir -p tmp/workspace
export WORK_DIR="$(pwd)/tmp/workspace" # This is important for the next step
```
Checkout the open-runtime repository and run the latest version:

```
cd runtimes/workspace/latest
PORT=3010 WORK_DIR=$WORK_DIR pnpx nodemon src/server.js
```

You should be good to go!