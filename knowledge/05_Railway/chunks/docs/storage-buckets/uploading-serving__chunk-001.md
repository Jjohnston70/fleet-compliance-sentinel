# Uploading & Serving Files (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/storage-buckets/uploading-serving.md
Original Path: docs/storage-buckets/uploading-serving.md
Section: docs
Chunk: 1/2

---

# Uploading & Serving Files

Learn how to upload and serve files from Railway Storage Buckets.

Buckets are private, but you can still work with their files in a few ways. You can serve files straight from the bucket, proxy them through your backend, or upload files directly from clients or services.

Bucket egress is free. Service egress is not. If your service sends data to users or uploads files to a bucket, that traffic counts as service egress. The sections below explain these patterns and how to avoid unnecessary egress.

## Presigned URLs

Presigned URLs are temporary URLs that grant access to individual objects in your bucket for a specific amount of time. They can be created with any S3 client library and can live for up to 90 days.

Files served through presigned URLs come directly from the bucket and incur no egress costs.

## Serve files with presigned URLs

You can deliver files directly from your bucket by redirecting users to a presigned URL. This avoids egress costs from your service, as the service isn't serving the file itself.

```ts

async function handleFileRequest(fileKey: string) {
  const isAuthorized = isUserAuthorized(currentUser, fileKey)
  if (!isAuthorized) throw unauthorized()

  const presignedUrl = s3.presign(fileKey, {
    expiresIn: 3600 // 1 hour
  })
  return Response.redirect(presignedUrl, 302)
}
```

Use-cases:
- Delivering user-uploaded assets like profile pictures
- Handing out temporary links for downloads
- Serving large files without passing them through your service
- Enforcing authorization before serving a file
- Redirecting static URLs to presigned URLs

## Serve files with a backend proxy

You can fetch a file in your backend and return it to the client. This gives you full control over headers, formatting, and any transformations. It does incur **service** egress, but it also lets you use CDN caching on your backend routes. Many frameworks support this pattern natively, especially for image optimization.

Use-cases:
- Transforming or optimizing images (resizing, cropping, compressing)
- Sanitizing files or validating metadata before returning them
- Taking advantage of CDN caching for frequently accessed files
- Web frameworks that already use a proxy for image optimization
