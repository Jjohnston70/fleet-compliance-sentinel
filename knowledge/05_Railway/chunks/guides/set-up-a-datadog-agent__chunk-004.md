# Set Up a Datadog Agent in Railway (Chunk 4/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/set-up-a-datadog-agent.md
Original Path: guides/set-up-a-datadog-agent.md
Section: guides
Chunk: 4/4

---

## Configuration for sending logs
formatter = json_log_formatter.JSONFormatter()

json_handler = logging.handlers.SysLogHandler(address=(os.getenv("DD_AGENT"), os.getenv("DD_AGENT_SYSLOG_PORT")))
json_handler.setFormatter(formatter)

logger = logging.getLogger('python-app')
logger.addHandler(json_handler)
logger.setLevel(logging.INFO)

# Configuration for sending metrics
config = {
    "api_key": os.getenv("DD_API_KEY"),
    "statsd_host": os.getenv("DD_AGENT_HOST"),
    "statsd_port": os.getenv("DD_AGENT_STATSD_PORT"),
    "statsd_constant_tags": ["env:prod"],
}

initialize(**config)

app = FastAPI()

# Use dogstatsd client for more custom metrics
dog_statsd = DogStatsd()

@app.get("/")
async def root():
    # Increment a simple counter
    statsd.increment('example_app.page.views')

    # Record a random gauge value
    gauge_value = random.uniform(1, 100)
    statsd.gauge('example_app.random_value', gauge_value)

    # Log a message
    logger.info(f"Page viewed, gauge value: {gauge_value}")

    # Custom metric using DogStatsd
    dog_statsd.histogram('example_app.response_time', random.uniform(50, 300))

    return {"message": "Hello World"}

# Additional route for testing
@app.get("/test")
async def test():
    # Custom metrics and logging
    statsd.increment('example_app.test.endpoint.hits')
    test_value = random.randint(1, 10)
    dog_statsd.gauge('example_app.test.value', test_value)
    logger.info(f"Test endpoint hit, value: {test_value}")

    return {"test_value": test_value}

```

**Ensure that you configure all of the required variables in the Python service in Railway -**

- DD_AGENT_HOST - _should be the private domain of the DataDog agent_
- DD_API_KEY
- DD_AGENT_STATSD_PORT - _should be 8125_
- DD_AGENT_SYSLOG_PORT - _should be **515** to work with the configuration below_

**Update the DataDog agent's `syslog.yaml` file to accept data from the new source -**

```plaintext
logs:
  - type: udp
    port: 514
    service: "node-app"
    source: syslog
  - type: udp
    port: 515
    service: "python-app"
    source: syslog
```

## Conclusion

Congratulations! You have deployed a Datadog Agent and a Node Express app (and maybe a Python service) that sends logs and metrics to Datadog.

This is a _very_ basic implementation, and you should refer to the [Datadog documentation](https://docs.datadoghq.com/) for information on how to customize the data you send.
