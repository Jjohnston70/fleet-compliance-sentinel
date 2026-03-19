# Template Best Practices (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/templates/best-practices.md
Original Path: docs/templates/best-practices.md
Section: docs
Chunk: 3/3

---

## Workspace naming

When users deploy a template, the template author appears as the name of the [workspace](/projects/workspaces) that created and published it.

Since the author is publicly visible and shown with the template to the users, it is important to make sure the workspace name is professional and **accurately represents your relationship to the software**.

**Important:** Only use a company or organization name as your workspace name if you are officially authorized to represent that entity. Misrepresenting your affiliation is misleading to users and violates trust.

**If you are officially affiliated** with the software (e.g., you work for ClickHouse and are creating a ClickHouse template), then using the official company name "ClickHouse, Inc." is appropriate and helpful for users to identify official templates.

**If you are not officially affiliated** with the software, always use your own professional name as the workspace name.

**Note:** To transfer a template from one workspace to another, [contact support](https://station.railway.com/).

## Overview

The overview is the first thing users will see when they click on the template, so it is important to make it count.

The overview should include the following:

- **H1: Deploy and Host [X] with Railway**

  What is X? Your description in roughly ~ 50 words.

- **H2: About Hosting [X]**

  Roughly 100 word description what's involved in hosting/deploying X

- **H2: Common Use Cases**

  In 3-5 bullets, what are the most common use cases for [X]?

- **H2: Dependencies for [X] Hosting**

  In bullet form, what other technologies are incorporated in using this template besides [X]?

- **H3: Deployment Dependencies**

  Include any external links relevant to the template.

- **H3: Implementation Details (Optional)**

  Include any code snippets or implementation details. This section is optional. Exclude if nothing to add.

- **H3: Why Deploy [X] on Railway?**

  Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

  By deploying [X] on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
