Title: Using the Database View
Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/docs/databases/database-view.md
Original Path: docs/databases/database-view.md
Section: docs

---

# Using the Database View

Learn how to read, insert and edit data via the database view on Railway.

Baked into the four, one-click database templates that Railway provides, is a Database Management Interface, this allows you to perform common actions on your Database such as viewing and editing the contents of your database services in Railway.

## SQL interfaces

For MySQL and Postgres, Railway displays the tables contained within an instance by default; this is called the Table View.

Shift-clicking on one or multiple tables exposes additional options such as the ability to delete the table(s).

### Creating a table

Under the Table View, clicking the Create Table button at the bottom right of the interface navigates users to the Create Table interface.

For each column a user wants to add to the database, the interface accepts a `name`, `type`, `default_value` and `constraints`. Depending on the SQL database that is used, valid types and constraints may vary.

### Viewing and editing entries

When a table is clicked, the interface navigates into the Entries View.

Under the Entries View, selecting an existing entry exposes the ability to edit the entry. When button that allows one to add entries to the table.

### Add SQL column

Selecting the add column in the entries view opens a modal that prompts you to add a new column to the table.

## Nosql interfaces

For non-structured data, Railway has interfaces that permit users to add and edit data within the service.

### Redis view

With Redis, Railway displays the keys contained within a database instance by default.

### MongoDB document view

With MongoDB, Railway displays a list of document collections. Users can add additional collections or add/edit documents within the collection.

### Adding MongoDB databases

Within the Collections View, clicking the plus icon next to the top dropdown allows you to create a new Database.

## Credentials tab

The Credentials tab allows you to safely regenerate your database password while keeping the database and environment variables synchronized, avoiding manual variable edits that can cause authentication mismatches.

It's important to manually redeploy any service that depends on the updated password variable (or the derived database URL).

## Extensions tab for Postgres

The Extensions tab enables postgres extensions management. You can view, install and uninstall extensions that are available in the official Railway Postgres image.

Extensions that aren't available need to be deployed from templates, since they require additional features in the database's image, like pgvector.
