"use strict";

const { Client } = require("pg");
const { hashPassword } = require("./crypto");

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
    createSecret,
    listSecrets,
    getSecret,
    updateSecret,
    deleteSecret,
  };
}

async function createUser(username, password) {
  await client.query("INSERT INTO users VALUES ($1, $2)", [
    username,
    await hashPassword(password),
  ]);
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

async function createSecret(user, name, value) {
  await client.query("INSERT INTO secrets VALUES ($1, $2, $3)", [
    user,
    name,
    value,
  ]);
  await client.end();
}

async function listSecrets(user) {
  const res = await client.query(
    "SELECT name FROM secrets WHERE username = $1",
    [user]
  );
  await client.end();
  return res.rows;
}

async function getSecret(user, name) {
  const res = await client.query(
    `
    SELECT name FROM secrets 
    WHERE username = $1 AND name = $2
  `,
    [user, name]
  );
  await client.end();

  if (res.rows.length > 0) {
    return res.rows[0];
  } else {
    return null;
  }
}

async function updateSecret(user, name, value) {
  await client.query(
    `
    UPDATE secrets
    SET value = $3
    WHERE user = $1 AND name = $2
  `,
    [user, name, value]
  );
  await client.end();
}

async function deleteSecret(user, name) {
  await client.query(
    `
    DELETE FROM secrets WHERE user = $1 AND name = $2
  `,
    [user, name]
  );
  await client.end();
}

module.exports = {
  createDb,
};
