# Add a CDN using Amazon CloudFront (Chunk 3/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/add-a-cdn-using-cloudfront.md
Original Path: guides/add-a-cdn-using-cloudfront.md
Section: guides
Chunk: 3/6

---

#### Observe route behavior with no CDN

To observe the behavior without a CDN in place, navigate to any of the routes above from the Railway-provided domain, your request will always go directly to the service running in Railway.

One way you can visualize this, is by navigating to the `/static` route in your browser, opening up Network Tools, and observing that each request always receives a **HTTP 200** status code:

Since the data for the route has not been cached on a CDN, the server receives every request, generates a new timestamp, and sends it back with a 200 status code.

Once the CloudFront CDN is set up, you will see how this behavior changes.
