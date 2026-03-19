# Create a Bridge from Railway to AWS RDS with Tailscale (Chunk 1/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/bridge-railway-to-rds-with-tailscale.md
Original Path: guides/bridge-railway-to-rds-with-tailscale.md
Section: guides
Chunk: 1/4

---

# Create a Bridge from Railway to AWS RDS with Tailscale

Learn how to securely access your AWS RDS database from Railway using a Tailscale subnet router.

## How can you privately send traffic from Railway to RDS?

In this tutorial, you will set up a Tailscale bridge to AWS RDS. This creates a secure tunnel between your Railway services and your AWS RDS database instances. This allows you to connect to your RDS databases privately without exposing traffic to the public internet.

### Objectives

In this tutorial, you will:

1. Deploy a Tailscale subnet router EC2 instance
1. Set up split DNS for domain resolution
1. Verify and test connectivity to your RDS instance
1. Route traffic from Railway to RDS using Railtail

This tutorial is in depth, so if it's your first time using Tailscale or setting up a bridge to your RDS instance, every detail is covered!

### Prerequisites

1. You will need an [AWS IAM access key or IAM Role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) to stand up resources with Terraform or OpenTofu.

   **NOTE:** While you can just put these secrets in a `~/.aws` folder or a `terraform.tfvars` file, it's a good practice to avoid putting secrets on disk unencrypted. If you have 1Password, you can use [1Password Secret References](https://developer.1password.com/docs/cli/secret-references/) so that your secrets are never stored permanently on disk. This is especially important to prevent AI tools from reading your keys and as an extra layer of protection from committing secrets to your git repositories.

2. You'll need to install [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli) or [OpenTofu](https://opentofu.org/docs/intro/install/).

3. You will need to generate a new ssh key that can be used to provision the AWS Instance.

4. You will need a [Tailscale account](https://tailscale.com/) and have [Tailscale installed](https://tailscale.com/kb/1347/installation) on your local machine. The free tier is generous and sufficient for this tutorial.

5. You will need to generate, store, and reference a [Tailscale Auth Key](https://login.tailscale.com/admin/settings/keys)

```bash

# Set your AWS credentials

# Or with 1password

# Generate an SSH key for the EC2 instance if you don't have one
ssh-keygen -t rsa -b 2048 -f ~/.ssh/tailscale-rds

# Set your Tailscale auth key

# terraform.tfvars
#...
tailscale_auth_key = "tskey-auth-1234567890"

# Or with 1password
tailscale_auth_key = $(op read op://vault-name/tailscale-auth-key/credential)
```

### Generate a Tailscale auth key

- Head over to the [Keys](https://login.tailscale.com/admin/settings/keys) page located within the settings menu on the Tailscale dashboard.

- Click **Generate auth key**.

  Put in a description like "AWS RDS Subnet Router" and leave all other settings as the default.

- Click **Generate key**.

  Tailscale will now show you the newly generated auth key. **Be sure to copy it down, and store it in secret store (like 1Password)**.

- Click **Done**.

## Git clone the example project

There is [an example project built in Terraform](https://github.com/echohack/rds-tailscale) (or OpenTofu if you prefer) to stand up all the AWS resources you'll need to test out connectivity to RDS.

```bash
git clone git@github.com:echohack/rds-tailscale.git
```
