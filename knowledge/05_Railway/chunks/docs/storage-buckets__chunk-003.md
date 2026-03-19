# Storage Buckets (Chunk 3/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/storage-buckets.md
Original Path: docs/storage-buckets.md
Section: docs
Chunk: 3/3

---

### Cost comparison

Railway Buckets offer competitive pricing compared to other S3-compatible storage providers:

|                    | Railway Buckets      | AWS S3 Standard       | Cloudflare R2          |
| ------------------ | -------------------- | --------------------- | ---------------------- |
| **Storage**        | $0.015 / GB-month    | $0.023 / GB-month     | $0.015 / GB-month      |
| **Egress**         | Free                 | $0.09 / GB            | Free                   |
| **API Operations** | Free (unlimited)     | $0.005 / 1K writes, $0.0004 / 1K reads | $4.50 / 1M Class A, $0.36 / 1M Class B |

Railway matches R2's storage pricing while offering free unlimited API operations. Compared to S3, Railway is more cost-effective on storage, egress, and operations.

## S3 compatibility

Buckets are fully S3-compatible. You can use them with any S3 client library for any language, tool, or framework, and you can expect the same functionality on Railway Buckets as if you were using a normal S3 bucket.

Supported features include:
- Put, Get, Head, Delete objects
- List objects, List objects V2
- Copy objects
- Presigned URLs
- Object tagging
- Multipart uploads

Not yet supported:
- Server-side encryption
- Object versioning
- Object locks
- Bucket lifecycle configuration

## Deleting a bucket

You can delete your bucket by clicking on it in your canvas, going to Settings, and selecting Delete Bucket. The bucket will disappear immediately from your project, but it's not permanently deleted yet. It will only be permanently deleted after two days to protect against [accidental deletions](https://blog.railway.com/p/how-we-oops-proofed-infrastructure-deletion-on-railway).

You will continue to be billed for your accumulated storage size until your bucket has been permanently deleted at the two-day mark. To prevent being billed for the storage, remove all files from the bucket before deleting it.

## FAQ

## Help us improve storage buckets

Upvote these feature requests on the feedback page if these features sound useful to you:

- [Native file explorer](https://station.railway.com/feedback/railway-storage-buckets-native-file-expl-e0bc1a5a)
- [Snapshots and backups](https://station.railway.com/feedback/railway-storage-buckets-backup-feature-8c44e697)
- [Publicly-accessible buckets](https://station.railway.com/feedback/public-railway-storage-buckets-1e3bdac8)

If you have an idea for other features, let us know on [this feedback page](https://station.railway.com/feedback/object-storage-tell-us-what-you-need-924b88fc).
