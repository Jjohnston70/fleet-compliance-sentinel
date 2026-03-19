# Observability Dashboard (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/observability.md
Original Path: docs/observability.md
Section: docs
Chunk: 2/2

---

## Editing/Deleting widgets

Under Edit mode, each widget will have a three dot menu at the upper right corner at the bounding box of the widget. Clicking into this menu will allow you to edit the data source or delete the widget.

To persist your changes, make sure you press Save at the top right corner.

## Monitors

The Observability Dashboard includes configurable monitoring alerts that send
email and in-app notifications when thresholds are reached. You can also
configure [webhooks](/observability/webhooks) to receive notifications when thresholds are reached.

Alerting thresholds can be configured to trigger above or below specified limits for:

- CPU
- RAM
- Disk usage
- Network egress

### Creating monitors

To create a monitor, navigate to any widget in the Observability Dashboard and click the three dot menu at the upper right corner of the widget. Select "Add monitor" from the dropdown menu to configure alerting for that specific widget.

<video
  src="https://res.cloudinary.com/railway/video/upload/v1761099058/docs/guides/observability/monitors-demo_hfklkm.webm"
  autoPlay
  loop
  muted
  playsInline
  style={{width: "100%", maxWidth: "800px", height: "auto", borderRadius: "8px"}}
/>

### Editing monitors

To edit an existing monitor, navigate to any widget that has monitoring configured and click the three dot menu at the upper right corner of the widget. Select "Edit monitor" from the dropdown menu to modify the monitor configuration for that widget.
