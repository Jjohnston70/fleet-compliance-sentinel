# Migrate from DigitalOcean to Railway (Chunk 1/1)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/platform/migrate-from-digitalocean.md
Original Path: docs/platform/migrate-from-digitalocean.md
Section: docs
Chunk: 1/1

---

# Migrate from DigitalOcean to Railway

Learn how to migrate your WordPress site from DigitalOcean to Railway with this step-by-step guide. Fast, seamless, and hassle-free.

This guide demonstrates how to migrate your WordPress site from DigitalOcean to Railway's modern cloud platform. Railway provides a streamlined deployment experience with powerful infrastructure features.

Railway offers:

- **Modern Infrastructure**: High-performance cloud platform

- **Quick Setup**: WordPress-ready deployment template

- **Database Support**: MariaDB database capabilities

- **Integrated SSL**: Automatic SSL certificate management

- **Scalable Infrastructure**: Easily handle traffic spikes and growth

- **Collaborative Features**: Team management, deployment protection, and role-based access

- **Priority Support**: Dedicated support for Railway users

## Migration steps

Let's walk through migrating a WordPress site from DigitalOcean to Railway. This process involves backing up your existing installation, deploying WordPress on Railway and then restoring from your backup.

### 1. Backup your WordPress site

- Ensure you have a backup of your existing site. Use a WordPress backup plugin of your choice to export your site data.

  Make sure this backup includes, All WordPress files, All WordPress database tables, All WordPress uploads.

- Document your current configuration

  - Note any custom domain settings

  - Keep track of your username and password for wp-admin.

### 2. Deploy WordPress

- Open the [WordPress Template](https://railway.com/template/EP4wIt) page

- Click "Deploy Now" to Deploy the WordPress template.

- Since this template doesn’t require any configuration, Click "Deploy" and wait for the deployment to complete.

The template will automatically configure -

- A MariaDB database

- Initial WordPress setup

- Required environment variables

- A temporary service domain

### 3. Restore your site content

After the template deployment completes -

1. Access your WordPress installation via the temporary service domain.

2. Configure your WordPress settings

3. Install your preferred backup plugin

4. Restore your site content from your backup

### 4. Configure domain settings

To set up your custom domain:

1. Open your service's Settings in Railway

2. Navigate to the "Networking" section

3. Add your custom domain

4. Update your DNS records according to the instructions given.

**Note:** You will need to redeploy your service for WordPress to pick up the new domain.

### 5. Verify migration

Before finalizing your migration -

1. Test all WordPress functionality

2. Verify all pages and posts are displaying correctly

3. Check media files are properly loaded

4. Test user authentication

5. Verify contact forms and other interactive elements

### 6. Performance optimization

Consider these optimization options for your WordPress deployment:

- Configure caching by placing Cloudflare or a similar CDN in front of your site.

- Optimize database performance by setting up a caching plugin.

- Set up appropriate scaling configurations.

- Implement CDN if needed

That's all you need to migrate your WordPress site from DigitalOcean to Railway! Need assistance? The [Central Station](https://station.railway.com/) is there to help you with any questions during your migration process.
