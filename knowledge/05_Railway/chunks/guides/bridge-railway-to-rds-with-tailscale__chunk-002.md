# Create a Bridge from Railway to AWS RDS with Tailscale (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/bridge-railway-to-rds-with-tailscale.md
Original Path: guides/bridge-railway-to-rds-with-tailscale.md
Section: guides
Chunk: 2/4

---

### Create terraform.tfvars

Create a `terraform.tfvars` file to store your variables:

```
aws_account = "your-aws-account-id"
rds_password = "your-secure-rds-password"
tailscale_auth_key = "tskey-your-tailscale-auth-key"
```

**!IMPORTANT**: Make sure you update your `userlist.txt` password to the same password as your new `rds_password`.

### Deploy

Initialize and apply the Terraform configuration:

```bash
terraform init
terraform plan
terraform apply
```

Review the changes and type `yes` to confirm deployment.

When the deployment completes, you'll see outputs including instructions for configuring split DNS and how to run the test script to verify your deployment.

## Configure split DNS in Tailscale

Split DNS allows Tailscale to resolve AWS RDS domain names using AWS DNS servers, which is required for RDS connectivity.

- Go to the [Tailscale Admin Console DNS settings](https://login.tailscale.com/admin/dns)
- Click **Add Nameserver** → Choose **Custom**

- Enter the VPC DNS server IP: `172.16.0.2` (VPC CIDR base + 2)
- Enable **Restrict to domains**
- Enter: `us-west-2.rds.amazonaws.com` (replace `us-west-2` with your AWS region)

- Click **Save**

## Approve advertised subnet routes and/or enable route acceptance on your devices

For devices you can't install Tailscale on, you need to [approve the routes in the Tailscale admin UI](https://login.tailscale.com/admin/machines).

- You will see a `Subnets !` badge on the machine you set up. This indicates it is advertising routes but hasn't been approved.
- Click the `...` next to the machine
- Click the checkbox and click save.
- Now the `!` will be removed from the `Subnets` badge, indicating that the advertised routes are approved.

For your local devices to access the subnet routes advertised by the subnet router, you can also enable route acceptance via the CLI:

```bash
tailscale set --accept-routes=true
```

## Verify connectivity

Run the verification script:

```bash
./verify_tailscale_routing.sh  postgres  rds-tailscale
```

The endpoint and other details can be found in the Terraform outputs after deployment.

If you're running into issues at this point, head down to the Troubleshooting section to help figure out what might be wrong.

## Connect to your RDS instance

Once the verification passes, you can connect to your RDS instance directly from your local machine using standard PostgreSQL tools or any database client:

```bash
psql -h  -U postgres -d tailscale_test_db
```

If you've never used Tailscale before, take a moment to familiarize yourself with the `tailscale` CLI and wrap your head around what's happening here. This is fantastic! You're routing traffic privately to your RDS instance from your local machine!

Similarly, you can now use this subnet router to route traffic from other devices in your Tailnet, including as a way to create a bridge between networks. Now you're ready to connect your Railway services! Let's do that next.
