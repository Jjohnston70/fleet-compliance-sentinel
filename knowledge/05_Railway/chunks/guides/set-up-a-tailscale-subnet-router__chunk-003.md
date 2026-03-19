# Set up a Tailscale Subnet Router (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/set-up-a-tailscale-subnet-router.md
Original Path: guides/set-up-a-tailscale-subnet-router.md
Section: guides
Chunk: 3/3

---

## 5. Connecting to a service on the private network (bonus)

This tutorial has used Postgres as an example service, so let's finally connect to it via its private domain and port!

You can use any database GUI tool you prefer, or none at all, since your setup allows you to connect to the database over the private network using any software.

Example: Your `prisma migrate deploy` or `python manage.py migrate` commands will now work locally without the need to use the public host and port for the database.

_Note the use of the private domain and port in the database URL._

**Additional Resources**

This tutorial explains how to set up a Tailscale Subnet router on Railway but does not delve into all the terminology and settings related to Tailscale.

We recommend reviewing the following Tailscale documentation:

- [Subnet router](https://tailscale.com/kb/1019/subnets)
- [Auth keys](https://tailscale.com/kb/1085/auth-keys)
- [Machine names](https://tailscale.com/kb/1098/machine-names)
- [DNS](https://tailscale.com/kb/1054/dns?q=dns#use-dns-settings-in-the-admin-console)
- [Tailscale FAQ](https://tailscale.com/kb/1366/faq)
