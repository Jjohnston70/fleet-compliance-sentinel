# Deploy a Spring Boot App (Chunk 1/3)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/spring-boot.md
Original Path: guides/spring-boot.md
Section: guides
Chunk: 1/3

---

# Deploy a Spring Boot App

Learn how to deploy a Spring Boot app to Railway with this step-by-step guide. It covers quick setup, one-click deploys, Dockerfile and other deployment strategies.

[Spring Boot](https://spring.io/projects/spring-boot) is a Java framework designed to simplify the creation of stand-alone, production-ready Spring applications that are easy to run right out of the box.

This guide covers how to deploy a Spring Boot app to Railway in four ways:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [From a GitHub repository](#deploy-from-a-github-repo).
3. [Using the CLI](#deploy-from-the-cli).
4. [Using a Dockerfile](#use-a-dockerfile).

Now, let's create a Spring Boot app!

## Create a Spring Boot app

**Note:** If you already have a Spring Boot app locally or on GitHub, you can skip this step and go straight to the [Deploy Spring Boot App to Railway](#deploy-the-spring-boot-app-to-railway).

To create a new Spring Boot app, ensure that you have [JDK](https://www.oracle.com/java/technologies/downloads/) installed on your machine.

Go to [start.spring.io](https://start.spring.io) to initialize a new Spring Boot app. Select the options below to customize and generate your starter app.

- Project: Maven
- Language: Java
- Spring Boot: 3.3.4
- Project Metadata:
  - Group: com.railwayguide
  - Artifact: helloworld
  - Name: helloworld
  - Description: Demo project for Railway Guide
  - Package name: com.railwayguide.helloworld
  - Packaging: jar
  - Java: 17
- Dependencies:
  - Click the **Add Dependencies** button and search for **Spring Web**. Select it.

![Spring Boot App Initializer](https://res.cloudinary.com/railway/image/upload/v1729619101/springboot_app_on_railway.png)
_Config to initialize your new app_

Now, click on the **Generate** button, download the zipped file and unpack it into a folder on your machine.

### Modify the application file

Next, open the app in your IDE and navigate to the `src/main/java/com/railwayguide/helloworld/HelloWorldApplication.java` file.

Replace the content with the code below:

```java
package com.railwayguide.helloworld;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class HelloworldApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelloworldApplication.class, args);
	}

	@GetMapping("/")
    public String hello() {
      return String.format("Hello world from Java Spring Boot!");
    }

}
```

A `hello()` method was added that returns the response: `Hello world from Java Spring Boot!`.

The `@RestController` annotation designates this class as a web controller, while `@GetMapping("/")` maps the `hello()` method to handle requests sent to the root URL, `/`.

### Run the Spring Boot app locally

Next, `cd` into the `helloworld` directory via the terminal and run the following Maven command:

```bash
./mvnw spring-boot:run
```

**Note:** This is a Maven wrapper for Linux and macOS, which uses a bundled version of Maven from **.mvn/wrapper/maven-wrapper.jar** instead of relying on the system-installed version.

Open your browser and go to `http://localhost:8080` to see your app.
