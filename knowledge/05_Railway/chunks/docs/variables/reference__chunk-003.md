# Variables Reference (Chunk 3/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/variables/reference.md
Original Path: docs/variables/reference.md
Section: docs
Chunk: 3/4

---

### Git variables

These variables are provided if the deploy originated from a GitHub trigger.

| Name                         | Description                                                                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RAILWAY_GIT_COMMIT_SHA`     | The git [SHA](https://docs.github.com/en/github/getting-started-with-github/github-glossary#commit) of the commit that triggered the deployment. Example: `d0beb8f5c55b36df7d674d55965a23b8d54ad69b` |
| `RAILWAY_GIT_AUTHOR`         | The user of the commit that triggered the deployment. Example: `gschier`                                                                                                                             |
| `RAILWAY_GIT_BRANCH`         | The branch that triggered the deployment. Example: `main`                                                                                                                                            |
| `RAILWAY_GIT_REPO_NAME`      | The name of the repository that triggered the deployment. Example: `myproject`                                                                                                                       |
| `RAILWAY_GIT_REPO_OWNER`     | The name of the repository owner that triggered the deployment. Example: `mycompany`                                                                                                                 |
| `RAILWAY_GIT_COMMIT_MESSAGE` | The message of the commit that triggered the deployment. Example: `Fixed a few bugs`                                                                                                                 |
