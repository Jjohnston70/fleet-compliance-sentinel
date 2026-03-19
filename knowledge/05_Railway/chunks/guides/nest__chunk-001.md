# Deploy a NestJS App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/nest.md
Original Path: guides/nest.md
Section: guides
Chunk: 1/3

---

# Deploy a NestJS App

Learn how to deploy a NestJS app to Railway with this step-by-step guide. It covers quick setup, database integration, one-click deploys and other deployment strategies.

[Nest](https://nestjs.com) is a modern Node.js framework designed to create efficient, reliable, and scalable server-side applications. Built on top of powerful HTTP server frameworks, it uses Express as the default but also offers seamless support for Fastify for enhanced performance and flexibility.

This guide covers how to deploy a Nest app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's go ahead and create a Nest app!

## Create a Nest app

**Note:** If you already have a Nest app locally or on GitHub, you can skip this step and go straight to the [Deploy Nest App to Railway](#deploy-the-nest-app-to-railway).

To create a new Nest app, ensure that you have [Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) and [NestJS](https://docs.nestjs.com/#installation) installed on your machine.

Run the following command in your terminal to create a new Nest app:

```bash
nest new helloworld
```

A new Nest app will be provisioned for you in the `helloworld` directory.

### Run the Nest app locally

Next, start the app locally by running the following command:

```bash
npm run start
```

Launch your browser and navigate to `http://localhost:3000` to view the app.

If you'd prefer to run the app on a different port, simply use the command `PORT=8080 npm run start` in the terminal.

Afterward, you can access the app at `http://localhost:8080`.

### Add and configure database

**Note:** This app uses Postgres. If you don’t have it installed locally, you can either [install it](https://www.postgresql.org/download) or use a different Node.js database package of your choice.

1. Create a database named `nestjshelloworld_dev`.

2. Install the following packages:

```bash
npm i @nestjs/typeorm typeorm pg
```

- typeorm is an ORM library for Typescript and JavaScript.
- pg is for communicating with Postgres database.

3. Open the `src/app.module.ts` file and modify the content to the code below:

```js

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "username",
      password: "password",
      database: "nestjshelloworld_dev",
      entities: [],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
```

Start the app using the command, `npm run start:dev`. The code above tries to connect to the database once the app is started. If any of the credentials are wrong, you will see a warning stating that the app can't connect to the database.

4. Open `src/app.service.ts` file and modify the content to return `Hello World, Welcome to Railway!`.

```js

@Injectable()
  getHello(): string {
    return "Hello World, Welcome to Railway!";
  }
}
```

5. Run the app again to see your changes in action!
