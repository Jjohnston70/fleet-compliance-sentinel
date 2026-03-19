# Webhooks (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/observability/webhooks.md
Original Path: docs/observability/webhooks.md
Section: docs
Chunk: 1/2

---

# Webhooks

Learn how to set up webhooks on Railway to receive real-time updates for deployments and events.

Webhooks can be used to notify your own application of deployment status changes and alerts. They are configured per project.

## Setup a webhook

Complete the following steps to setup a webhook:

1. Open an existing Project on Railway.
1. Click on the `Settings` button in the top right-hand corner.
1. Navigate to the Webhooks tab.
1. Input your desired webhook URL.
1. Optional: specify which events to receive notifications for.
1. Click `Save Webhook`.

The URL you provide will receive a webhook payload when any service's deployment status changes or an alert is triggered. This will be executed across all environments in the project.

## Platform events

Webhooks can be used to receive notifications for a variety of events on the platform:

- **Deployment status changes** - Available deployment states can be found in the [Deployments reference](/deployments#deployment-states).
- **Volume usage alerts** - Notifications when volumes approach capacity.
- **CPU/RAM monitor alerts** - Notifications when resource usage exceeds thresholds.

## Webhook payload

When an event occurs, Railway sends a JSON payload to your configured webhook URL.

### Example payload

```json
{
  "type": "Deployment.failed",
  "details": {
    "id": "8107edff-4b8e-44fc-b43a-04566e847a2a",
    "source": "GitHub",
    "status": "SUCCESS",
    "branch": "...",
    "commitHash": "...",
    "commitAuthor": "...",
    "commitMessage": "...",
  },
  "resource": {
    "workspace": { "id": "", "name": "" },
    "project": { "id": "", "name": "" },
    "environment": { "id": "", "name": "", "isEphemeral": false },
    "service": { "id": "", "name": "" },
    "deployment": { "id": "" }
  },
  "severity": "WARNING",
  "timestamp": "2025-11-21T23:48:42.311Z"
}
```

## Testing webhooks

The `Test Webhook` button will send a test payload to the specified webhook URL.

Note: For security reasons, test webhooks are sent from the frontend client, which may result in Cross-Origin Resource Sharing (CORS) restrictions. This typically presents as a delivery failure when using the test webhook functionality.

## Muxers: provider-specific webhooks

For certain webhook URLs, Railway will automatically transform the payload to match the destination (we call these Muxers). This makes it easy to use webhooks without having to write your own middleware to format the request body.

Currently supported providers:

- Discord
- Slack
