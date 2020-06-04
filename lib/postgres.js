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
  await client.query("INSERT INT secrets VALUES ($1, $2, $3)", [
    user,
    name,
    value,
  ]);
  await client.end();
}

async function listSecrets(user) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare("SELECT name FROM secrets WHERE user = ?");
    stmt.all(user, (err, rows) => {
      if (err) return reject(err);

      resolve(rows);
    });
  });
}

async function getSecret(user, name) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare(
      `SELECT name FROM secrets 
      WHERE user = ? AND name = ?
    `
    );
    stmt.get(user, (err, row) => {
      if (err) return reject(err);

      resolve(row);
    });
  });
}

async function updateSecret(user, name, value) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare(
      `UPDATE secrets
      SET value = ?
      WHERE user = ? AND name = ?`
    );
    stmt.run(value, user, name, (err) => {
      if (err) return reject(err);

      resolve(row);
    });
  });
}

async function deleteSecret(user, name) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare(
      `
      DELETE FROM secrets WHERE user = ? AND name = ?
      `
    );
    stmt.run(user, name, (err) => {
      if (err) return reject(err);

      resolve();
    });
  });
}

module.exports = {
  createDb,
};
