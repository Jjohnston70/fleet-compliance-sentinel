# Storage Buckets (Chunk 2/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/storage-buckets.md
Original Path: docs/storage-buckets.md
Section: docs
Chunk: 2/3

---

### Railway-provided variables

Railway provides the following variables which can be used as [Variable References](/variables#referencing-a-shared-variable).

| Name                       | Description                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `BUCKET`                   | The globally unique bucket name for the S3 API. Example: `my-bucket-jdhhd8oe18xi`                |
| `SECRET_ACCESS_KEY`        | The secret key for the S3 API.                                                                   |
| `ACCESS_KEY_ID`            | The key id for the S3 API.                                                                       |
| `REGION`                   | The region for the S3 API. Example: `auto`                                                       |
| `ENDPOINT`                 | The S3 API endpoint. Example: `https://storage.railway.app`                                      |
| `RAILWAY_PROJECT_NAME`     | The project name the bucket belongs to.                                                          |
| `RAILWAY_PROJECT_ID`       | The project id the bucket belongs to.                                                            |
| `RAILWAY_ENVIRONMENT_NAME` | The environment name of the bucket instance.                                                     |
| `RAILWAY_ENVIRONMENT_ID`   | The environment id of the bucket instance.                                                       |
| `RAILWAY_BUCKET_NAME`      | The bucket name.This is not the bucket name to use for the S3 API. Use `BUCKET` instead.         |
| `RAILWAY_BUCKET_ID`        | The bucket id.                                                                                   |

## Serving and uploading files

Buckets are private, but you can still work with their files in a few ways. You can serve files straight from the bucket using presigned URLs, proxy them through your backend, or upload files directly from clients or services.

Bucket egress is free. Service egress is not. If your service sends data to users or uploads files to a bucket, that traffic counts as service egress.

Learn about the different patterns for working with files in the [Uploading & Serving Files](/storage-buckets/uploading-serving) guide.

## Buckets in environments

Each environment gets its own separate bucket instance with isolated credentials. When you [duplicate an environment](/environments#create-an-environment) or use [PR environments](/environments#enable-pr-environments), you won't need to worry about accidentally deleting production objects, exposing sensitive data in pull requests, or polluting your production environment with test data.

## How buckets are billed

Buckets are billed at **$0.015** per GB-month. All S3 API operations and bucket egress are unlimited and free.

For detailed pricing information, plan limits, and billing examples, see the [Storage Buckets Billing](/storage-buckets/billing) page.
