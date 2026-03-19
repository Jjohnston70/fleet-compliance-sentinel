# Webhooks (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/observability/webhooks.md
Original Path: docs/observability/webhooks.md
Section: docs
Chunk: 2/2

---

### Setting up a webhook for discord

Discord supports integrating directly with webhooks. To enable this on a server you will need to be an admin or otherwise have the appropriate permissions.

1. On Discord, open the settings for a server text channel. This menu can be accessed via the cogwheel/gear icon where the channel is listed on the server.
2. Click on the integrations tab.
3. Click on the webhooks option.
4. You will see an option to create a new webhook, click this button and fill out your preferred bot name and channel.
5. Once created, you will have the option to copy the new webhook URL. Copy that URL.
6. Back in Railway, open the project you wish to integrate with.
7. Click on the project's deployments menu.
8. Navigate to the settings tab.
9. Input the copied webhook URL into the input under "Build and Deploy Webhooks".
10. Click the checkmark to the right of the input to save.

At this point, the Discord Muxer will identify the URL and change the payload to accommodate the Discord integration. You can see this if you expand the payload preview panel.

You are now done! When your project deploys again, that Discord channel will get updates on the deployment!

### Setting up a webhook for slack

Slack supports integrating directly with webhooks.

1. Enable incoming webhooks for your Slack instance (Tutorial [here](https://api.slack.com/messaging/webhooks#enable_webhooks))
1. Generate a `hooks.slack.com` webhook URL for your channel (Tutorial [here](https://api.slack.com/messaging/webhooks#create_a_webhook))
1. Open up Railway, navigate to your project's Webhook tab.
1. Paste the url from slack

## Troubleshooting

Having issues with webhooks? Check out the [Troubleshooting guide](/troubleshooting) or reach out on the [Railway Discord](https://discord.gg/railway).
