# Deploy a Beego App (Chunk 2/4)

Source: https://github.com/railwayapp/docs/blob/f4594b3f032cd0266b636cdc9b6ff5e75113f851/content/guides/beego.md
Original Path: guides/beego.md
Section: guides
Chunk: 2/4

---

### Configure database

Run `go get github.com/lib/pq` in your terminal to install the Go Postgres driver.

Create a database, `helloworld_dev` in your local Postgres instance.

Open the `main.go` file and modify the content to the code below:

```go
package main

import (
	"fmt"
	_ "helloworld/routers"

	_ "github.com/lib/pq"

	"github.com/beego/beego/v2/client/orm"
	beego "github.com/beego/beego/v2/server/web"
)

// Users -
type Users struct {
	ID        int    `orm:"column(id)"`
	FirstName string `orm:"column(first_name)"`
	LastName  string `orm:"column(last_name)"`
}

func init() {
	// set default database
	orm.RegisterDriver("postgres", orm.DRPostgres)

	// set default database
	orm.RegisterDataBase("default", "postgres", "postgres://unicodeveloper:@localhost/helloworld_dev?sslmode=disable")

	// register model
	orm.RegisterModel(new(Users))

	// create table
	orm.RunSyncdb("default", false, true)
}

func main() {
	o := orm.NewOrm()

	// Create a slice of Users to insert
	users := []Users{
		{FirstName: "John", LastName: "Doe"},
		{FirstName: "Jane", LastName: "Doe"},
		{FirstName: "Railway", LastName: "Deploy Beego"},
	}

	// Iterate over the slice and insert each user
	for _, user := range users {
		id, err := o.Insert(&user)
		if err != nil {
			fmt.Printf("Failed to insert user %s %s: %v\n", user.FirstName, user.LastName, err)
		} else {
			fmt.Printf("Inserted user ID: %d, Name: %s %s\n", id, user.FirstName, user.LastName)
		}
	}

	beego.Run()
}
```

Replace this `postgres://username:@localhost/helloworld_dev?sslmode=disable` with the appropriate URL for your local Postgres database.

**Code Summary**:

- The Users struct defines the schema for the users table in the database.
- The `init()` function registers the Postgres driver, registers the Users model, and automatically creates the users table in the database. If any errors occur while inserting users, they are logged.
- The `main()` function creates an ORM instance, defines sample user data (first name and last name), inserts the data into the users table, and starts the Beego web server to serve your app.

### Run the Beego app locally

To start your app, run:

```bash
bee run
```

Once the app is running, open your browser and navigate to `http://localhost:8080` to view it in action.

In your terminal, you’ll see logs indicating that the user data is being inserted. Head over to your database, and you should see the users table populated with the seeded data.

### Prepare Beego app for deployment

1. Open the `conf/app.conf` file and add an environment variable, `DATABASE_URL` to it.

```go
db_url = ${DATABASE_URL}
```

2. Head over to the `main.go` file and make some modifications to the way the Postgres database url is retrieved. The `init()` function should look like this:

```go
func init() {
	// set default database
	orm.RegisterDriver("postgres", orm.DRPostgres)

	// set default database
	dbURL, err := beego.AppConfig.String("db_url")
	if err != nil {
		log.Fatal("Error getting database URL: ", err)
	}

	orm.RegisterDataBase("default", "postgres", dbURL)

	// register model
	orm.RegisterModel(new(Users))

	// create table
	orm.RunSyncdb("default", false, true)
}
```

## Deploy the Beego app to Railway

Railway offers multiple ways to deploy your Beego app, depending on your setup and preference.
