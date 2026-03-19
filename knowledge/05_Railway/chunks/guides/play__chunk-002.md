# Deploy a Scala Play App (Chunk 2/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/play.md
Original Path: guides/play.md
Section: guides
Chunk: 2/5

---

# Default database configuration using PostgreSQL
db.default.driver = org.postgresql.Driver
db.default.url = "jdbc:postgresql://username:password@127.0.0.1:5432/scala_play"  # Replace with correct credentials
```

Make sure to replace `username` and `password` with your PostgreSQL credentials.

_Step 5_ : Update Project Dependencies

To download the PostgreSQL driver and any updated dependencies, run the following:

```bash
sbt update
```

_Step 6_ : Add Database Migration Tool (Flyway)

Play doesn’t include built-in support for database migrations, so Flyway will be used.

1. Install Flyway Plugin: Open your `project/plugin.sbt` and add the Flyway plugin:

```scala
addSbtPlugin("io.github.davidmweber" % "flyway-sbt" % "7.4.0")
```

2. Configure Flyway in `build.sbt`: Enable Flyway and configure the database connection in your `build.sbt`:

```scala
name := """helloworld"""
organization := "com.railwayguide"
version := "1.0-SNAPSHOT"
executableScriptName := "main"

lazy val root = (project in file(".")).enablePlugins(PlayScala).enablePlugins(FlywayPlugin)

scalaVersion := "2.13.15"

libraryDependencies += guice
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.1" % Test
libraryDependencies += "org.postgresql" % "postgresql" % "42.7.4" // Latest version

flywayUrl := "jdbc:postgresql://127.0.0.1:5432/scala_play?user="  # Replace with correct credentials
flywayLocations := Seq("filesystem:src/main/resources/db/migration")
```

Replace `username` with your database username.

_Step 7_ : Create the Migration Files

1. **Create Migration Folder**: Create the folder structure for your migration files:

```bash
src/main/resources/db/migration
```

2. **Create Migration SQL File**: In `src/main/resources/db/migration`, create a schema migration file called `V1_0__create_employees_table.sql` with the following content:

```sql
CREATE TABLE employee (
  id VARCHAR(20) PRIMARY KEY,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  email VARCHAR(30),
  admin BOOLEAN
);
```

_Step 8_ : Run Database Migrations

Once your migration file is in place, run the Flyway migration with the following command:

```bash
sbt flywayMigrate
```

This will apply the migration and create the employee table in your PostgreSQL database.

Check your database to confirm that the employee table has been successfully created. You can use a database tool like psql or any PostgreSQL client to view the table.

### Run the Play app locally

Next, run `sbt run` in the terminal to build the project, install all the dependencies and start the embedded [Pekko](https://pekko.apache.org) HTTP server.

Open your browser and go to `http://localhost:9000` to see the app.
