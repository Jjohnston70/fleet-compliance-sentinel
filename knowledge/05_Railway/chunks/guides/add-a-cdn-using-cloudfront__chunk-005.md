# Add a CDN using Amazon CloudFront (Chunk 5/6)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/add-a-cdn-using-cloudfront.md
Original Path: guides/add-a-cdn-using-cloudfront.md
Section: guides
Chunk: 5/6

---

### Checkpoint 2

Great job! You should now have a CloudFront distribution pointed to your Fastify service in Railway. Your distribution will be assigned a domain similar to the one below:

- `https://d1a23bcdefg.cloudfront.net`

Now let's see how the behavior for the `/dynamic` route has changed when accessing the server from the CloudFront distribution domain.

Notice how the first request was served an **HTTP 200** from the server with the dynamically generated data, but subsequent requests were served a **HTTP 304 Not Modified** code.

This is the CloudFront CDN in action!

If you inspect the route definition for `/dynamic`, you'll see that the headers include a `cache-control` parameter:

    ```javascript
    reply.headers({
        'cache-control': 'must-revalidate, max-age=60'
    });
    ```

This cache control definition tells CloudFront to revalidate the data at the route after 60s.

#### Cache behavior

When the initial request is made to the route, CloudFront retrieves the data from the server, then stores it. For 60s after the initial request, CloudFront will serve the cached response with **HTTP 304**, and after 60s, it will check the server for new data.

#### Faster response time

In the screenshot above, take note of the Size and Time columns.

When CloudFront serves the cached data, it takes significantly less time to resolve the route, and, probably due to less headers, the Size of the message is also smaller.
