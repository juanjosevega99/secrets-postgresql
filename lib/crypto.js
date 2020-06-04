"use strict";

const crypto = require("crypto");
const bcrypt = require("bcrypt");

const saltRounds = 5;

async function hashPassword(pass) {
  return bcrypt.hash(pass, saltRounds);
}

module.exports = {
  hashPassword,
};
