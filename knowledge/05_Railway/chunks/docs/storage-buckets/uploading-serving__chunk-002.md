# Uploading & Serving Files (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/storage-buckets/uploading-serving.md
Original Path: docs/storage-buckets/uploading-serving.md
Section: docs
Chunk: 2/2

---

## Upload files with presigned URLs

You can generate a presigned URL that lets the client upload a file directly to the bucket, without handling the upload in your service. Doing so prevents service egress and reduces memory consumption.

```ts
// server-side

async function prepareImageUpload(fileName: string) {
  const isAuthorized = isUserAuthorized(currentUser, fileKey)
  if (!isAuthorized) throw unauthorized()

  // The key under which the uploaded file will be stored.
  // Make sure that it's unique and users cannot override
  // each other's files.
  const Key = `user-uploads/${currentUser.id}/${fileName}`

  const { url, fields } = await createPresignedPost(new S3Client(), {
    Bucket: process.env.S3_BUCKET,
    Key,
    Expires: 3600,
    Conditions: [
      { bucket: process.env.S3_BUCKET },
      ['eq', '$key', Key],

      // restrict which content types can be uploaded
      ['starts-with', '$Content-Type', 'image/'],

      // restrict content length, to prevent users
      // from uploading suspiciously large files.
      // max 2 MB in this example.
      ['content-length-range', 5_000, 2_000_000],
    ],
  })

  return Response.json({ url, fields })
}

// client-side
async function uploadFile(file) {
  const res = await fetch('/prepare-image-upload', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name })
  })
  const { url, fields } = await res.json()

  const form = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    form.append(key, value)
  })
  form.append('Content-Type', file.type)
  form.append('file', file)

  await fetch(url, {
    method: 'POST',
    body: form
  })
}
```

Similar to handling uploads through your service, be mindful that users may try to upload HTML, JavaScript, or other executable files. Treat all uploads as untrusted. Consider validating or scanning the file after the upload completes, and remove anything that shouldn't be served.

Use-cases:
- Uploading files from the browser
- Mobile apps uploading content directly
- Large file uploads where you want to avoid streaming through your service

## Upload files from a service

A service can upload directly to the bucket using the S3 API. This will incur service egress.

```ts

async function generateReport() {
  const report = await createPdfReport()

  await s3.putObject("reports/monthly.pdf", report, {
    contentType: "application/pdf"
  })
}
```

Use-cases:
- Background jobs generating files such as PDFs, exports, or thumbnails
- Writing logs or analytics dumps to storage
- Importing data from a third-party API and persisting it in the bucket
