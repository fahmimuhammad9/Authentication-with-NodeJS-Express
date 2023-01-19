"use strict";

const server = require('./server');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

http.createServer(server).listen(`${process.env.APP_PORT}`, `${process.env.APP_HOST}`, () => {
    console.log(`Rest-API Auth Panel Started on ${process.env.APP_HOST} PORT ${process.env.APP_PORT}`);
});
