# Deploy Node.js & Express API with Autoscaling, Secrets, and Zero Downtime (Chunk 3/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Original Path: guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime.md
Section: guides
Chunk: 3/6

---

## Deploy to Railway from GitHub

Now let's deploy this API to Railway. First, create a Railway account by going to [railway.com/new](https://railway.com/new) and signing up with your [GitHub](https://github.com/) account.

1. **Create a GitHub repository**:
   - Go to [GitHub](https://github.com/) and click "New repository"
   - Name it `my-express-api` (or any name you prefer)
   - Make it public or private
   - Don't initialize with README, .gitignore, or license (you already have these)
   - Click "Create repository"

2. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial Express API"
   git remote add origin https://github.com/yourusername/my-express-api.git
   git push -u origin main
   ```

   Learn more about [Git basics](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository) if you're new to version control.

3. **Deploy from Railway**:
   - In Railway, click "Deploy from GitHub repo"
   - Select your repository
   - Railway automatically detects it's a Node.js app

4. **Configure environment variables**:
   - Click on your deployed service
   - Go to the "Variables" tab
   - Add the following variables:
     - `NODE_ENV=production`
     - `APP_NAME=My Production API`
   - Apply the changes and deploy

5. **Generate a public URL**:
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Your API is now live at `https://your-app.up.railway.app`. When you visit this URL, you should see your Express API running.

Learn more about [deploying applications](/templates/deploy), [public networking](/networking/public-networking), and [staged changes](/deployments/staged-changes) in Railway.

## Scaling and pricing

Railway automatically manages your application's scaling without any configuration needed. Here's how it works:

### Vertical scaling (automatic)

Railway automatically scales your service vertically by increasing CPU and memory allocation as traffic grows. This happens seamlessly up to your plan's limits

Check out the Railway [pricing page](https://railway.com/pricing) for more details about the different plans and their limits.

### Horizontal scaling (one-click)

For high-traffic applications, you can scale horizontally by deploying multiple replicas:

1. In your Railway project, click on your service
2. Go to the "Settings" tab
3. Under "Scaling", increase the instance count
4. Railway automatically distributes traffic across all replicas

![Horizontal scaling](https://res.cloudinary.com/railway/image/upload/v1758247839/docs/horizontal_scaling_xil1q0.png)

Each replica runs with the full resource limits of your plan. So if you're on the Pro plan and deploy 3 replicas, you get a combined capacity of 72 vCPU and 72 GB RAM.

```bash
Total resources = number of replicas × maximum compute allocation per replica
```
