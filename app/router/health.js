"use strict";

const express       = require('express');
const dotenv        = require('dotenv');
const moment        = require('moment');
const {POOL}        = require('../config/pg-config');
const HEAlTH_ROUTER = express.Router(); 

dotenv.config();

HEAlTH_ROUTER.route('/').get(async (req, res) => {
    try {
        const connect = await POOL.query('SELECT NOW()');
        let APP_STATUS = {
            status: 'RUNNING',
            name: process.env.APP_NAME,
            version: process.env.APP_VERSION,
            description: process.env.APP_DESC,
            build_date: moment(new Date('2022-05-15 00:00:00')).tz('Asia/Jakarta').format('dddd, DD MMM YYYY HH:mm'),
            connection: {
                status: connect.rowCount > 0 ? 'Connected' : 'Disconnected',
                db: 'PostgreSQL',
                version: connect.rowCount > 0 ? await (await POOL.query(`SELECT VERSION()`)).rows[0].version : ''
            }
        };
        res.json({status:'OK', success:true, message:APP_STATUS})
    } catch(err) {
        res.json({status:'OK', success:false, message:err.message});
    }
});

module.exports = HEAlTH_ROUTER;