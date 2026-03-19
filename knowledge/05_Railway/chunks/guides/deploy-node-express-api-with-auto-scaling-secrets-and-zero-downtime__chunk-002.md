# Deploy Node.js & Express API with Autoscaling, Secrets, and Zero Downtime (Chunk 2/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Original Path: guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Section: guides
Chunk: 2/6

---

### Create the project structure

Create a `src` directory and the main application file:

```bash
mkdir src
```

Create `src/app.ts` with the following code:

```typescript

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Express API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    appName: process.env.APP_NAME || 'My Express API'
  });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Set up environment variables

Create a `.env` file in your project root to store environment variables:

```bash

# .Env
APP_NAME=My Express API
NODE_ENV=development
PORT=3000
```

**Important**: Create a `.gitignore` file in your project root and add the following entries to keep sensitive data and dependencies out of version control:

```gitignore

# Environment variables
.env

# Dependencies
node_modules/

# Build output
dist/

# Logs
*.log
```

This ensures that sensitive environment variables, installed dependencies, and build artifacts are not committed to your repository.

Learn more about [`.gitignore` patterns](https://git-scm.com/docs/gitignore) and [environment variable security best practices](https://12factor.net/config).

Learn more about [managing variables](/variables) in Railway.

### Update package.json scripts

Update your `package.json` to include the necessary scripts. Learn more about [npm scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts):

```json
{
  "scripts": {
    "dev": "tsx src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

### Run the development server

Now you can run your TypeScript application using [tsx](https://tsx.is/), which provides seamless TypeScript execution without worrying about configuration:

```bash
npm run dev
```

If you open your browser and navigate to `http://localhost:3000`, you'll see your Express API running with TypeScript support.

Learn more about [customizing builds](/builds) and [build configuration](/builds/build-configuration) in Railway.
