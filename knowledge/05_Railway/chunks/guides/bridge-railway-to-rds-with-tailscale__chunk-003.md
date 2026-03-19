# Create a Bridge from Railway to AWS RDS with Tailscale (Chunk 3/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/bridge-railway-to-rds-with-tailscale.md
Original Path: guides/bridge-railway-to-rds-with-tailscale.md
Section: guides
Chunk: 3/4

---

## Deploy railtail into your project

Railtail is a project that will forward SOCK5 traffic to RDS, because right now Railway containers don't allow privilege escalation. This way you can use private IPv6 networking to Railtail and forward your traffic privately to your AWS Subnet Router, which will then route to RDS.

- In a project where you want to bridge services privately to RDS, click the Create button in the upper right corner. Then select Template -> Type in RailTail.

You will need four variables to deploy Railtail and start bridging traffic to your RDS instance:

- **LISTEN_PORT**: This is the port that Railtail listens on to forward traffic. We like `41641`, which is Tailscale's default UDP port for making peer-to-peer connections.
- **TARGET_ADDR**: The target address that Railtail will forward traffic to. In this case it should be `tailscale-test-db...rds.amazonaws.com`. You can grab this from the output of the terraform run you did earlier, or in the AWS console.
- **TS_AUTH_KEY**: The tailscale auth key you set up earlier. In the format: `tskey-auth-0123456789`
- **TS_HOSTNAME**: The friendly DNS name you can reference in your Tailnet. You can name this whatever you want. `railtail` or `railtail-project-name` is a good name here.

Click **Deploy Template**.

## Bridge traffic to RDS

Now you can connect any service to your RDS backend. Add a variable to your connecting Service like: `DATABASE_URL="postgresql://USERNAME:PASSWORD@${{railtail.RAILWAY_PRIVATE_DOMAIN}}:${{railtail.LISTEN_PORT}}/postgres"`

That's it! Now you're bridging traffic privately from Railway to RDS.

## Cleanup

When you're done with the tutorial, and so that AWS doesn't charge you money while your instances sit idle, you can destroy the resources you created automatically with:

```bash
terraform destroy -auto-approve
```

## Troubleshooting

If you encounter issues with connectivity check the `verify_tailscale_routing` script included with the repository. You may be encountering:

1. **DNS Resolution**:

- Verify split DNS configuration in Tailscale.
- Check that the correct AWS DNS server IP is being used.

2. **Route Acceptance**:

- Ensure subnet routes are being advertised by the subnet router and that you've approve those routes in the Tailscale Admin Console.
- Verify your client is accepting routes with `tailscale status`.

3. **Database Connection Failures**:

- Check security group rules to ensure the subnet router can access RDS.
- Confirm you're using the correct credentials. (!IMPORTANT `manage_master_user_password = false` must be set or else the RDS module will ignore using your set password)

4. **Subnet Router Issues**:

- Check that IP forwarding on is enabled with `cat /proc/sys/net/ipv4/ip_forward`.
- Verify Tailscale is running with `sudo systemctl status tailscaled`.
