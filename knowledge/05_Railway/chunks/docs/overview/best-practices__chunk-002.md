# Best Practices (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/overview/best-practices.md
Original Path: docs/overview/best-practices.md
Section: docs
Chunk: 2/2

---

## Use reference variables where applicable

[Reference variables](/variables#reference-variables) allow you to dynamically reference another variable, either from a variable set on the current [service](/overview/the-basics#services) or from another service in the same [project](/overview/the-basics#project--project-canvas).

Rather than manually copying, pasting, and hard-coding variables like a public domain or those from another service, you can use reference variables to build them dynamically. Example `VITE_BACKEND_HOST=${{Backend.RAILWAY_PUBLIC_DOMAIN}}`

This approach is better than hard-coding variables, as it keeps your variable values in sync. Change your [public domain](/networking/domains)? The variable updates. Change your [TCP proxy](/networking/tcp-proxy)? The variable updates.

Screenshot showing a reference variable used to reference the Backend's domain.
