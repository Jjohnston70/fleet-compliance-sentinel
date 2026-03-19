# Staged Changes (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/deployments/staged-changes.md
Original Path: docs/deployments/staged-changes.md
Section: docs
Chunk: 1/1

---

# Staged Changes

Discover how to use staged changes in Railway to deploy updates gradually.

Changes made in your Railway project, like adding, removing, or making changes to components, will be staged in a changeset for you to review and apply.

It is important to be familiar with this flow as you explore the upcoming guides.

### What to expect

As you create or update components within your project:

1. The number of staged changes will be displayed in a banner on the canvas
2. Staged changes will appear as purple in the UI

### Review and deploy changes

To review the staged changes, click the "Details" button in the banner. Here, you will see a diff of old and new values. You can discard a change by clicking the "x" to the right of the change.

You can optionally add a commit message that will appear in the [activity feed](/projects#viewing-recent-activity).

Clicking "Deploy" will deploy all of the changes at once. Any services that are affected will be redeployed.

Holding the "Alt" key while clicking the "Deploy" button allows you to commit the changes without triggering a redeploy.

### Caveats

- Networking changes are not yet staged and are applied immediately
- Adding databases or templates will only affect the current environment. However, they do not yet create a commit in the history
