# Cron Jobs (Chunk 1/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cron-jobs.md
Original Path: docs/cron-jobs.md
Section: docs
Chunk: 1/2

---

# Cron Jobs

Learn how to run cron jobs on Railway.

Cron Jobs allow you to start a service based on a crontab expression.

Services configured as cron jobs are expected to execute a task, and terminate as soon as that task is finished, leaving no open resources.

## How it works

Railway will look for a defined cron schedule in your service settings, and execute the start command for that service on the given schedule. The service is expected to execute a task, and exit as soon as that task is finished, not leaving any resources open, such as database connections.

#### Scheduling libraries

If you are already using a scheduling library or system in your service such as [node-cron](https://www.npmjs.com/package/node-cron) or [Quartz](http://www.quartz-scheduler.org/), Railway cron jobs are a substitute of them that allows you to save resources between executions.

## Configuring a cron job

To configure a cron job:

1. Select a service and go to the Settings section.
2. Within "Cron Schedule", input a [crontab expression](#crontab-expressions).
3. Once the setting is saved, the service will run according to the cron schedule.

## Service execution requirements

Scheduled services should exit as soon as they are done with the task they are responsible to perform. Thus, the process should close any connections, such as database connections, to exit properly.

Currently, Railway does not automatically terminate deployments. As a result, if a previous execution is still running when the next scheduled execution is due, Railway will skip the new cron job.

### Why isn't my cron running as scheduled?

An important requirement of a service that runs as a Cron, is that it terminates on completion and leaves no open resources. If the code that runs in your Cron service does not exit, subsequent executions of the Cron will be skipped.

If you see that a previous execution of your Cron service has a status of `Active`, the execution is still running and any new executions will not be run.

## Crontab expressions

A crontab expression is a scheduling format used in Unix-like operating systems to specify when and how often a command or script should be executed automatically.

Crontab expressions consists of five fields separated by spaces, representing different units of time. These fields specify the minute, hour, day of the month, month, and day of the week when the command should be executed.

```
* * * * *
│ │ │ │ │
│ │ │ │ └─────────── Day of the week (0 - 6)
│ │ │ └───────────── Month (1 - 12)
│ │ └─────────────── Day of the month (1 - 31)
│ └───────────────── Hour (0 - 23)
└─────────────────── Minute (0 - 59)
```

The values of these fields can be an asterisk `*`, a list of values separated by commas, a range of values (using `-`), step values (using `/`) or an integer value.
