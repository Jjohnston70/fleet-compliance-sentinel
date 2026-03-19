Title: Manage Domains with the Public API
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/manage-domains.md
Original Path: guides/manage-domains.md
Section: guides

---

# Manage Domains with the Public API

Learn how to manage domains via the public GraphQL API.

Here are examples to help you manage domains using the Public API.

## List domains for a service

Get all domains (both Railway-provided and custom) for a service:

## Service domains (*.railway.app)

### Create a service domain

Generate a Railway-provided domain:

### Delete a service domain

## Custom domains

### Check domain availability

Check if a custom domain can be added:

### Add a custom domain

### Get custom domain status

Check DNS configuration status:

### Update a custom domain

### Delete a custom domain

## DNS configuration

After adding a custom domain, you need to configure DNS records. The required records are returned in the `status.dnsRecords` field.

### For root domains (example.com)

Add an A record or ALIAS record pointing to the Railway IP.

### For subdomains (api.example.com)

Add a CNAME record pointing to your Railway service domain.

### DNS record statuses

| Status | Description |
|--------|-------------|
| `PENDING` | DNS record not yet configured |
| `VALID` | DNS record is correctly configured |
| `INVALID` | DNS record is configured incorrectly |

### Certificate statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Certificate is being issued |
| `ISSUED` | Certificate is active |
| `FAILED` | Certificate issuance failed |
