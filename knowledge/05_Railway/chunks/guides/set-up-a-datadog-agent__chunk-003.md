# Set Up a Datadog Agent in Railway (Chunk 3/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/set-up-a-datadog-agent.md
Original Path: guides/set-up-a-datadog-agent.md
Section: guides
Chunk: 3/4

---

#### Create the services

- In Railway, create an Empty Service by clicking `+ New` button in the top right-hand corner and choosing `Empty Service` in the prompt.
- Right click on the service that is created, select `Update Info` and name it `datadog-agent`.
- Repeat the above steps to create a second service, but name the second service `expressapi`.

#### Add the variables

Each service requires unique variables listed below. For each service, follow the steps to add the variables required for the service.

`datadog-agent` Variables -

```plaintext
DD_API_KEY=
DD_HOSTNAME=${{RAILWAY_PRIVATE_DOMAIN}}
DD_SITE=
```

`expressapi` Variables -

```plaintext
DD_AGENT_HOST=${{datadog-agent.DD_HOSTNAME}}
DD_AGENT_STATSD_PORT=8125
DD_AGENT_SYSLOG_PORT=514
DD_TRACE_AGENT_PORT=8126
```

- Click on the service card
- Click on the `Variables` tab
- Click on `Raw Editor`
- Paste the required variables (be sure to update the Datadog API key and site with your own values)
- Click `Update Variables` and `Deploy`

## 5. Deploy to Railway

Now you're ready to deploy the services. Use the CLI to push code from your local machine to Railway.

#### Railway up

Follow these steps for each service -

- In your local terminal, change directory into the `agent` folder.
- Link to `datadog-project` by running the following command -
  ```plaintext
  railway link
  ```
- Follow the prompts, selecting the `datadog-project` and `production` environment.
- Link to the `datadog-agent` service by running the following command -
  ```plaintext
  railway service
  ```
- Follow the prompt, selecting the `datadog-agent` service.
- Deploy the agent by running the following command -
  ```plaintext
  railway up -d
  ```
- Change directory into your `expressapi` folder and repeat the steps above, but for the `expressapi` service.

#### Create a domain for the Express app

The express app will send logs and metrics to the Datadog agent upon navigation to either of its two routes. So let's give it a domain -

- Ensure that you are linked to the `datadog-project` and `expressapi` service (refer to the steps above)
- Assign the `expressapi` a domain by running the following command -
  ```plaintext
  railway domain
  ```

## 6. Test and confirm

Test that your Datadog Agent is receiving and forwarding data to Datadog by navigating to the routes in the Express app -

- `/`
- `/test`

Generate some traffic to these two routes and verify in your Datadog instance that the data is there.

_Note: it can take a few minutes to see the data in Datadog, check the Datadog Agent's logs in Railway_

## Bonus - add a Python service

Once you have your agent setup and working with a node app. It's easy to add more services and configure the agent to accept data from them. This bonus section quickly covers a Python implementation.

The following example uses the [FastAPI Python framework](https://fastapi.tiangolo.com/).

**In the `main.py` file, both metrics and logs are configured to be sent over StatsD and SysLog respectively -**

```python
import logging.handlers
from fastapi import FastAPI
from datadog import initialize, statsd, DogStatsd
import logging
import random
import os
import json_log_formatter
