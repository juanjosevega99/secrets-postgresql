"use strict";

const { Client } = require("pg");

const dbUrl = "postgresql://postgresql:pg123@localhost:5432/secretsdb";
const client = new Client({
  connectionStings: dbUrl,
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
      username  text REFERENCES users (username)
      name      text NOT NULL,
      value     text NOT NULL,
      PRIMARY KEY (user, name)
    );
  `,
};
