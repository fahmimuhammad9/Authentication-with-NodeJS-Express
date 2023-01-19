"use strict";

const {Client, Pool} = require('pg');
const dotenv         = require('dotenv');
dotenv.config()

const POOL = new Pool({
    host: `${process.env.PG_HOST}`,
    port: `${process.env.PG_PORT}`,
    database: `${process.env.PG_DB}`,
    user: `${process.env.PG_USER}`,
    password: `${process.env.PG_PASS}`
});

const CLIENT = new Client({
    host: `${process.env.PG_HOST}`,
    port: `${process.env.PG_PORT}`,
    database: `${process.env.PG_DB}`,
    user: `${process.env.PG_USER}`,
    password: `${process.env.PG_PASS}`
});
CLIENT.connect();

module.exports = {CLIENT, POOL}