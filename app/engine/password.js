"use strict";

const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config()

const PASSWORD_HASH = (password) => {
    let hash = crypto.pbkdf2Sync(password, process.env.SALT, parseInt(process.env.ITERATIONS), 64, `md5`).toString(`hex`); 
    return hash;
}

const VALID_PASSWORD = (password, hash) => {
    let pass = crypto.pbkdf2Sync(password, process.env.SALT, parseInt(process.env.ITERATIONS), 64, `md5`).toString(`hex`); 
    return hash === pass;
}

const PIN_HASH = (pin) => {
    let hash = crypto.pbkdf2Sync(pin, process.env.SALT_PIN, 1000, 64, `sha512`).toString(`hex`); 
    return hash;
}

const VALID_PIN = (pin, hash) => {
    let pass = crypto.pbkdf2Sync(pin, process.env.SALT_PIN, 1000, 64, `sha512`).toString(`hex`); 
    return hash === pass;
}

module.exports = {
    PASSWORD_HASH,
    VALID_PASSWORD,
    PIN_HASH,
    VALID_PIN
}