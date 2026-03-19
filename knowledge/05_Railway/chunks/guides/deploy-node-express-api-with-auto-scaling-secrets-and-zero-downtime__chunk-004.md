# Deploy Node.js & Express API with Autoscaling, Secrets, and Zero Downtime (Chunk 4/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Original Path: guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Section: guides
Chunk: 4/6

---

### Multi-region deployment

Railway also supports multi-region deployments for global applications:

1. Deploy replicas in different geographical regions
2. Railway automatically routes traffic to the nearest region
3. Traffic is then distributed randomly across available replicas within that region

![Multi-region deployment](https://res.cloudinary.com/railway/image/upload/v1758247839/docs/multi-region_deployment_h5fxqz.png)

This gives you both high availability and low latency for users worldwide, all with just a few clicks.

Learn more about [scaling applications](/deployments/scaling) and [optimizing performance](/deployments/optimize-performance) in Railway.

### Usage-based pricing

Railway follows a usage-based pricing model that depends on how long your service runs and the amount of resources it consumes. You only pay for activce CPU and memory, not for idle time.

```
Active compute time x compute size (memory and CPU)
```

![railway usage-based pricing](https://res.cloudinary.com/railway/image/upload/v1753470546/docs/comparison-docs/railway-usage-based-pricing_efrrjn.png)

Pricing plans start at $5/month. You can check out the [pricing page](https://railway.com/pricing) for more details.

## Add healthcheck for zero-downtime deployments

To ensure zero-downtime deployments, you'll need to add a healthcheck endpoint that Railway can use to verify your application is running properly. Learn more about [health check patterns](https://microservices.io/patterns/observability/health-check-api.html) and [zero-downtime deployment strategies](https://martinfowler.com/bliki/BlueGreenDeployment.html).

### Add the healthcheck endpoint

Update your `src/app.ts` file to include a healthcheck endpoint:

```typescript
// Add this route before app.listen()
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

Your complete `src/app.ts` should now look like this:

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

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    appName: process.env.APP_NAME || 'My Express API'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Deploy the healthcheck

Push your changes to GitHub:

```bash
git add .
git commit -m "Add healthcheck endpoint"
git push origin main
```
