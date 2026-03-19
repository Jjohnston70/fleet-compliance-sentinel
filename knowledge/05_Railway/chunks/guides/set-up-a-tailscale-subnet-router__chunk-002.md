# Set up a Tailscale Subnet Router (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/set-up-a-tailscale-subnet-router.md
Original Path: guides/set-up-a-tailscale-subnet-router.md
Section: guides
Chunk: 2/3

---

## 2. Configure split DNS

Properly configuring the nameserver in Tailscale is essential for enabling local DNS lookups for your private domains.

- Open the [DNS](https://login.tailscale.com/admin/dns) page.

- Under the **Nameservers** Header, click **Add Nameserver** → Click **Custom**.

  This is where you'll tell Tailscale how to route the DNS lookups for your `railway.internal` domains.

- Enter `fd12::10` as the Nameserver.

  This DNS nameserver is used across all private networks in every environment and will handle your DNS queries for private domains.

- Enable the **Restrict to domain** option, AKA Split DNS.

- Enter in `railway.internal` as the domain.

  This makes sure only DNS lookups for your private domain are forwarded to the private DNS resolver.

- Click **Save**.

## 3. Deploy the Tailscale subnet router

This will be the gateway into your environment's private network.

- Open the project that contains the services you want to access privately.

  For this tutorial, you will deploy the Subnet Router into a project with a Postgres database service.

- In the top right of the project canvas, click **Create** → Choose **Template**.

- Search for the [Tailscale Subnet Router](https://railway.com/template/tailscale) template.

  Choose the result that is published by **Railway Templates**.

- A ghost service will appear, Paste in your Auth Key from earlier.

- Click **Deploy Template**

This template will start to deploy and once deployed it will register itself as a machine in your tailnet with the name automatically derived from the project's name and environment name.

## 4. Approve the subnet

Your subnet router will advertise the private network's CIDR range but you will need to manually approve it.

- Head back over to the [Machines dashboard](https://login.tailscale.com/admin/machines).

You will see your newly deployed machine with its name that was previously derived from the project and environment.

    Notice theSubnets

    Info box under the machine name.

- Click on the machine's 3-dot menu → **Edit route settings**.

- Click the radio button on the `fd12::/16` to accept it.

    This route covers the entire private networking range allowing you to access all services within the project.

- Click **Save**.

- Ensure that the **Use Tailscale subnets** option is enabled in your Tailscale client's Settings or Preferences menu.

**That is it for all the configurations needed, you can now call any service via its private domain and port just as if you were another service within the private network!**
