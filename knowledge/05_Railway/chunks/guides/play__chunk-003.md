# Deploy a Scala Play App (Chunk 3/5)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/play.md
Original Path: guides/play.md
Section: guides
Chunk: 3/5

---

### Prepare Scala Play app for deployment

1. **Set Application Secret**:
   - Open up the `application.conf` file and add the following to it to set the app's secret.
     ```scala
     play.http.secret.key=${?APPLICATION_SECRET}
     ```
2. **Set Database URL**:
   - Open up the `application.conf` file and add the following to it to ensure the `DATABASE_URL` is read from the environment variable.
     ```scala
     db.default.url="jdbc:${?DATABASE_URL}"
     ```
3. **Set Allowed Hosts**:
   - By default, Play ships with a list of [default Allowed Hosts filter](https://www.playframework.com/documentation/3.0.x/resources/confs/play-filters-helpers/reference.conf). This is the list of allowed valid hosts = ["localhost", ".local", "127.0.0.1"]. You need to add an option to allow Railway hosts, `[".up.railway.app"]`.
   - Add the following to the `application.conf` file:
     `scala
    play.filters.hosts.allowed=[".up.railway.app"]
    `
     **Note:** Railway provided domains end in `.up.railway.app`. Once you add your custom domain, please update the allowed hosts to the new URL.
4. **Add sbt-native-packager sbt plugin**:

   - Add the `sbt-native-packager` sbt plugin to `project/plugins.sbt`
     ```scala
     addSbtPlugin("com.github.sbt" % "sbt-native-packager" % "x.x.x")
     ```
   - Enable the `JavaAppPackaging` plugin in `build.sbt` and set the `executableScriptName` to `main`. Your `build.sbt` should be looking like this now:

     ```scala
     name := """helloworld"""
     organization := "com.railwayguide"

     version := "1.0-SNAPSHOT"

     executableScriptName := "main"

     lazy val root = (project in file(".")).enablePlugins(PlayScala).enablePlugins(JavaAppPackaging).enablePlugins(FlywayPlugin)

     scalaVersion := "2.13.15"

     libraryDependencies += guice
     libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.1" % Test
     libraryDependencies += "org.postgresql" % "postgresql" % "42.7.4" // Always use the latest stable version

     flywayUrl := sys.env.getOrElse("DATABASE_URL", "jdbc:postgresql://127.0.0.1:5432/scala_play?user=username")

     flywayLocations := Seq("filesystem:src/main/resources/db/migration")
     ```

   - Run `sbt update` to install the `sbt-native-packager` and update the dependencies.

Now you're ready to deploy to Railway!

## Deploy the Play app to Railway

Railway offers multiple ways to deploy your Scala app, depending on your setup and preference.

### One-click deploy from a template

If you’re looking for the fastest way to get started, the one-click deploy option is ideal.

Click the button below to begin:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/my9q_q)

It is highly recommended that [you eject from the template after deployment](/templates/deploy#eject-from-template-repository) to create a copy of the repo on your GitHub account.

**Note:** You can also choose from a [variety of Scala app templates](https://railway.com/templates?q=scala) created by the community.
