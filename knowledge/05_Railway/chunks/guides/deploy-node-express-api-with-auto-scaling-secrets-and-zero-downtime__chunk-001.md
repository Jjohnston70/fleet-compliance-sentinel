# Deploy Node.js & Express API with Autoscaling, Secrets, and Zero Downtime (Chunk 1/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Original Path: guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Section: guides
Chunk: 1/6

---

# Deploy Node.js & Express API with Autoscaling, Secrets, and Zero Downtime

Learn how to deploy Node.js and Express applications with automatic scaling, environment secrets, zero-downtime updates, and preview environments, all without managing servers or learning Kubernetes/container orchestration.

In this guide, you'll learn how to deploy a [Node.js](https://nodejs.org/) and [Express.js](https://expressjs.com/) API to production using Railway. You'll build and deploy an API with automatic scaling, environment secrets management, and preview environments.

## What is Railway?

Railway is a modern deployment platform that enables you to deploy applications without managing servers, configuring load balancers, or learning Kubernetes. It provides automatic scaling, zero-downtime deployments, and built-in CI/CD.

Learn more about Railway's [core components and foundations](/overview/the-basics).

## Prerequisites

This is a beginner-friendly guide. However, it assumes basic knowledge of [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) or [TypeScript](https://www.typescriptlang.org/) (preferred). You'll also need to have Node.js installed on your machine.

To successfully complete this guide, you'll need:

- A Railway account
- A [GitHub](https://github.com/) account with [git](https://git-scm.com/) configured
- Node.js installed locally - you can use [nvm](https://github.com/nvm-sh/nvm) to manage your Node.js versions

You can find the final code on [GitHub](https://github.com/railway/nodejs-express-tutorial).

## Project setup

Let's create a new Node.js project from scratch with TypeScript support. First, create a new directory and initialize the project:

```bash
mkdir my-express-api
cd my-express-api
npm init -y
```

### Install TypeScript and dependencies

Install TypeScript, Express, and the necessary type definitions:

```bash
npm install express dotenv
npm install -D typescript @types/node @types/express tsx
```

- [Express](https://expressjs.com/) - Web framework for Node.js
- [dotenv](https://www.npmjs.com/package/dotenv) - Loads environment variables from `.env` files
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [tsx](https://tsx.is/) - TypeScript execution engine

### Configure TypeScript

Create a `tsconfig.json` file in your project root. Learn more about [TypeScript configuration options](https://www.typescriptlang.org/tsconfig):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
