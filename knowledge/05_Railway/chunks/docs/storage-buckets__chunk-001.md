# Storage Buckets (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/storage-buckets.md
Original Path: docs/storage-buckets.md
Section: docs
Chunk: 1/3

---

# Storage Buckets

Persist assets in object storage.

Railway Buckets are private, S3-compatible object storage buckets for your projects. They give you durable object storage on Railway without needing to wire up an external provider. Use them for file uploads, user-generated content, static assets, backups, or any data that needs reliable object storage.

## Getting started

To create a bucket in your project, click the Create button on your canvas, select Bucket, and select its region and optionally change its name. You aren't able to change your region after you create your bucket.

Unlike traditional S3, you can choose a custom display name for your bucket. The actual S3 bucket name is that display name plus a short hash, ensuring it stays unique across workspaces.

## Connecting to your bucket

Railway Buckets are private, meaning you can only edit and upload your files by authenticating with the bucket's credentials. To make files accessible publicly, you can use [presigned URLs](#presigned-urls), or proxy files through a backend service. Read more in [Serving and Uploading Files](#serving-and-uploading-files).

Public buckets are currently not supported.

Once your bucket is deployed, you'll find S3-compatible authentication credentials in the Credentials tab of the bucket. These include the necessary details for you to connect to your bucket using your S3 client library.

### URL style

Railway Buckets use [virtual-hosted–style URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#virtual-hosted–style-access), where the bucket name appears as the subdomain of the S3 endpoint. This is the standard S3 URL format, and most libraries support it out of the box. In most cases you only need to provide the base endpoint (`https://storage.railway.app`) and the client builds the full virtual-hosted URL automatically.

Buckets that were created before this change might require you to use [path-style URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html#path-style-access) instead. The Credentials tab of your bucket will tell you which style you should use.

### Variable references

Storage Buckets can provide the S3 authentication credentials to your other services by using [Variable References](/variables#referencing-a-shared-variable). You can do this in two ways:
