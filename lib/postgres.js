"use strict";

const { Client } = require("pg");

const dbUrl = "postgresql://postgres:pg123@localhost:5432/secretsdb";
const client = new Client({
  connectionString: dbUrl,
});

const queries = {
  tableUsers: `
    CREATE TABLE IF NOT EXISTS users (
      username text PRIMARY KEY,
      password text NOT NULL
    );
  `,
  tableSecrets: `
    CREATE TABLE IF NOT EXISTS secrets (
      username  text REFERENCES users (username),
      name      text NOT NULL,
      value     text NOT NULL,
      PRIMARY KEY (username, name)
    );
  `,
};

async function createDb() {
  await client.connect();

  await client.query(queries.tableUsers);
  await client.query(queries.tableSecrets);

  return {
    client,
    createUser,
    listUsers,
  };
}

async function createUser(username, password) {
  await client.query("INSERT INTO users VALUES ($1, $2)", [username, password]);
  await client.end();
}

async function listUsers() {
  const res = await client.query("SELECT username AS user FROM users");
  client.end();
  return {
    count: res.rowCount,
    users: res.rows,
  };
}

module.exports = {
  createDb,
};
