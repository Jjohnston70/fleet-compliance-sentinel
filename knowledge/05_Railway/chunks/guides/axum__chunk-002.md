# Deploy a Rust Axum App (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/axum.md
Original Path: guides/axum.md
Section: guides
Chunk: 2/4

---

### Modify the application file

Next, open the app in your IDE and navigate to the `src/main.rs` file.

Replace the content with the code below:

```rust
use axum::{
    routing::get,
    Router,
};

#[tokio::main]
async fn main() {
    // build your application with a single route
    let app = Router::new().route("/", get(root));

    // Get the port number from the environment, default to 3000
    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string()) // Get the port as a string or default to "3000"
        .parse() // Parse the port string into a u16
        .expect("Failed to parse PORT");

    // Create a socket address (IPv6 binding)
    let address = SocketAddr::from(([0, 0, 0, 0, 0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(&address).await.unwrap();

    // Run the app with hyper, listening on the specified address
    axum::serve(listener, app).await.unwrap();
}

// basic handler that responds with a static string
async fn root() -> &'static str {
    "Hello World, from Axum!"
}
```

The code above sets up a simple web server using the Axum framework and the Tokio async runtime. The server listens on the port gotten from the environment variable, `PORT` and defaults to `3000` if there's none set.

It defines one route, `/`, which is mapped to a handler function called `root`. When a GET request is made to the root path, the handler responds with the static string "Hello World, from Axum!".

The Router from Axum is used to configure the route, and `tokio::net::TcpListener` binds the server to listen for connections on all available network interfaces (address `0.0.0.0`).

The asynchronous runtime, provided by the `#[tokio::main]` macro, ensures the server can handle requests efficiently. The `axum::serve` function integrates with the Hyper server to actually process requests.

### Run the Axum app locally

Run the following command in the `helloworld` directory via the terminal:

```bash
cargo run
```

All the dependencies will be installed and your app will be launched.

Open your browser and go to `http://localhost:3000` to see your app.

## Deploy the Axum app to Railway

Railway offers multiple ways to deploy your Axum app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/5HAMxu)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Axum templates](https://railway.com/templates?q=axum) created by the community.
