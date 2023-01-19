'use strict';

const express = require('express');
const dotenv = require('dotenv');
const AUTH_ROUTER = express.Router();
const SECURITY = require('../security');
const REGISTER = require('../modules/register');

dotenv.config();

AUTH_ROUTER.route('/login').post(SECURITY.auth);
AUTH_ROUTER.route('/loginByUser').post(SECURITY.authByUser);
AUTH_ROUTER.route('/loginByEmail').post(SECURITY.authByEmail);
AUTH_ROUTER.route('/loginByPhoneNumber').post(SECURITY.authByPhoneNumber);
AUTH_ROUTER.route('/check').post(SECURITY.check);


AUTH_ROUTER.route('/register').post(REGISTER.created);

module.exports = AUTH_ROUTER;
