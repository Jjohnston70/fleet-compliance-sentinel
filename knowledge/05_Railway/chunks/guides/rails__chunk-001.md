# Deploy a Ruby on Rails App (Chunk 1/7)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/rails.md
Original Path: guides/rails.md
Section: guides
Chunk: 1/7

---

# Deploy a Ruby on Rails App

Learn how to deploy a Rails app to Railway with this step-by-step guide. It covers quick setup, database integration, cron and sidekiq setups, one-click deploys and other deployment strategies.

Rails is a Ruby full-stack framework designed to compress the complexity of modern web apps. It ships with all the tools needed to build amazing web apps on both the front and back end.

## Create a Rails app

**Note:** If you already have a Rails app locally or on GitHub, you can skip this step and go straight to the [Deploy Ruby on Rails App on Railway](#deploy-ruby-on-rails-app-on-railway).

To create a new Rails app, ensure that you have [Ruby](https://www.ruby-lang.org/en/documentation/installation) and [Rails](https://guides.rubyonrails.org/getting_started.html#creating-a-new-rails-project-installing-rails-installing-rails) installed on your machine. Once everything is set up, run the following command in your terminal:

```bash
rails new blog --database=postgresql
```

This command will create a new Rails app named `blog` with PostgreSQL as the database config. Now, let’s create a simple "Hello World" page to ensure everything is working correctly.

1. **Generate a Controller**: Run the following command to create a new controller named `HelloWorld` with an `index` action:

   ```bash
       rails g controller HelloWorld index
   ```

   This will generate the necessary files for the controller, along with a view, route, and test files.

2. **Update the Routes File**: Open the `config/routes.rb` file and modify it to set the root route to the `hello_world#index` action:

   ```ruby
   Rails.application.routes.draw do
       get "hello_world/index"
       # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

       # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
       # Can be used by load balancers and uptime monitors to verify that the app is live.
       get "up" => "rails/health#show", as: :rails_health_check

       # Render dynamic PWA files from app/views/pwa/*
       get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
       get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

       # Defines the root path route ("/")
       root "hello_world#index"
   end
   ```

3. **Modify the View**: Open the `app/views/hello_world/index.html.erb` file and replace its content with the following:

   ```ruby
   Hello World

    This is a Rails app running on Railway
   ```

4. **Run the Application Locally**: Start the Rails server by running:

   ```bash
       bin/rails server
   ```

   Open your browser and go to `http://localhost:3000` to see your "Hello World" page in action.

Now that your app is running locally, let’s move on to deploying it to Railway!

## Deploy Ruby on Rails app on Railway

Railway offers multiple ways to deploy your Rails app, depending on your setup and preference. Choose any of the following methods:

1. [One-click deploy from a template](#one-click-deploy-from-a-template).
2. [Using the CLI](#deploy-from-the-cli).
3. [From a GitHub repository](#deploy-from-a-github-repo).
