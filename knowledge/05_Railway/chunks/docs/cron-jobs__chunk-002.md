# Cron Jobs (Chunk 2/2)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/cron-jobs.md
Original Path: docs/cron-jobs.md
Section: docs
Chunk: 2/2

---

#### Field definitions

- **Minute (0-59)**: Represents the minute of the hour when the command should be executed. An asterisk (`*`) denotes any value, meaning the command will be executed every minute, or you can specify a specific minute value (e.g., 0, 15, 30).

- **Hour (0-23)**: Represents the hour of the day when the command should be executed. You can specify a specific hour value (e.g., 0, 6, 12), or use an asterisk (`*`) to indicate any hour.

- **Day of the month (1-31)**: Represents the day of the month when the command should be executed. You can specify a specific day value (e.g., 1, 15, 31), or use an asterisk (`*`) to indicate any day.

- **Month (1-12)**: Represents the month when the command should be executed. You can specify a specific month value (e.g., 1, 6, 12), or use an asterisk (`*`) to indicate any month.

- **Day of the week (0-7, where both 0 and 7 represent Sunday)**: Represents the day of the week when the command should be executed. You can specify a specific day value (e.g., 0-Sunday, 1-Monday, etc.), or use an asterisk (`*`) to indicate any day of the week.

Note that schedules are based on UTC (Coordinated Universal Time).

## Frequency

The shortest time between successive executions of a cron job cannot be less than 5 minutes.

## Examples

- Run a command every hour at the 30th minute: `30 * * * *`

- Run a command every day at 3:15 PM: `15 15 * * *`

- Run a command every Monday at 8:00 AM: `0 8 * * 1`

- Run a command every month on the 1st day at 12:00 AM: `0 0 1 * *`

- Run a command every Sunday at 2:30 PM in January: `30 14 * 1 0`

- Run a command every weekday (Monday to Friday) at 9:30 AM: `30 9 * * 1-5`

- Run a command every 15 minutes: `*/15 * * * *`

- Run a command every 2 hours: `0 */2 * * *`

- Run a command every 2nd day of the month at 6:00 AM: `0 6 2 * *`

## FAQ

### When to use railway's cron jobs?

- For short-lived tasks that complete quickly and exit properly, such as a daily database backup.
- When you want to save resources between task executions, as opposed to having an in-code scheduler run 24/7.

### When not to use railway's cron jobs?

- For long-running processes that don't exit, such as a web server or discord bot.
- When you need more frequent execution than every 5 minutes.
- When you need absolute time precision. Railway does not guarantee execution times to the minute as they can vary by a few minutes.

### What time zone is used for cron jobs?

Cron jobs are scheduled based on UTC (Coordinated Universal Time).

You will need to account for timezone offsets when setting your cron schedule.
