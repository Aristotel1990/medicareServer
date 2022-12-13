# Medicare Server

Simple doctor appointment RestFull project using express
## Installation

To run this project you will need [node](https://nodejs.org/en/download/) installed and [mysql](https://dev.mysql.com/doc/mysql-installation-excerpt/5.7/en/) to run mecidare.
Or if you have already installed docker use [this tutorial](https://www.howtogeek.com/devops/how-to-run-mysql-in-a-docker-container/) or run:


```bash
docker pull mysql:8.0
docker run --name my-mysql -e MYSQL_ROOT_PASSWORD=secret -v $HOME/mysql-data:/var/lib/mysql -d mysql:8.0

```
Before run the server make sure to create a database with name doctor, or if you chose another db name make sure to change it in **src/config/config.js**.
the defaults values are :
 DB_NAME = NODE_ENV === "dev" ? "doctor" : process.env.DB_NAME;
 DB_USER = NODE_ENV === "dev" ? "root" : process.env.DB_USER;
 DB_PASS = NODE_ENV === "dev" ? "test1234" : process.env.DB_PASS;
 DB_HOST = NODE_ENV === "dev" ? "localhost" : process.env.DB_HOST;
 DB_PORT = process.env.DB_PORT || 3306;

## Install packages

```bash
npm i

```
## Run Seeders
```bash
npx sequelize-cli db:seed:all

this allows to insert two doctors data on DB
```

## Run server

```bash
npm run dev

this allows to run the server

```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.