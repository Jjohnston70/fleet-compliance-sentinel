# Application Failed to Respond (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/networking/troubleshooting/application-failed-to-respond.md
Original Path: docs/networking/troubleshooting/application-failed-to-respond.md
Section: docs
Chunk: 1/2

---

# Application Failed to Respond

Learn how to troubleshoot and fix the 'Application Failed to Respond' error.

## What this error means

Seeing that your application failed to respond means that Railway's Edge Proxy cannot communicate with your application, causing your request to fail with a 502 (Bad Gateway) status code.

## Why this error can occur

There are a few reasons why this error can occur, the most common being that your application is not listening on the correct host or port.

Another common reason is that your [target port](/networking/public-networking#target-ports) is set to an incorrect value.

In some far less common cases this error can also occur if your application is under heavy load and is not able to respond to the incoming request.

## Possible solutions

The correct solution depends on the cause of the error.

### Target port set to the incorrect value

If your domain is using a [target port](/networking/public-networking#target-ports), ensure that the target port for your public domain matches the port your application is listening on.

This setting can be found within your [service settings](/overview/the-basics#service-settings).

In the screenshot above, the domain was previously incorrectly configured with port 3000, when the application was actually listening on port 8080.

### Application not listening on the correct host or port

Your web server should bind to the host `0.0.0.0` and listen on the port specified by the `PORT` environment variable, which Railway automatically injects into your application.

Start your application's server using:

- Host = `0.0.0.0`
- Port = Value of the `PORT` environment variable provided by Railway.

**Below are some solution examples for common languages and frameworks.**

#### Node / Express

```javascript
// Use PORT provided in environment or default to 3000
const port = process.env.PORT || 3000;

// Listen on `port` and 0.0.0.0
app.listen(port, "0.0.0.0", function () {
  // ...
});
```

#### Node / Nest

```javascript
// Use `PORT` provided in environment or default to 3000
const port = process.env.PORT || 3000;

// Listen on `port` and 0.0.0.0
async function bootstrap() {
  // ...
  await app.listen(port, "0.0.0.0");
}
```

#### Node / next

Next needs an additional flag to listen on `PORT`:

```bash
next start --port ${PORT-3000}
```

#### Python / gunicorn

`gunicorn` listens on `0.0.0.0` and the `PORT` environment variable by default:

```bash
gunicorn main:app
```

#### Python / uvicorn

`uvicorn` needs additional configuration flags to listen on `0.0.0.0` and `PORT`:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### Go / net/http

This example is for `net/http` in the Go standard library, but you can also apply this to other frameworks:

```go
func main() {
  // ...
  // Use `PORT` provided in environment or default to 3000
  port := cmp.Or(os.Getenv("PORT"), 3000)

  log.Fatal(http.ListenAndServe((":" + port), handler))
  // ...
}
```
