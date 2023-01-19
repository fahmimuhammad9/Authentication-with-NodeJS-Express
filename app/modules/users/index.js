'use strict';

const dotenv = require('dotenv');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { CLIENT } = require('../../config/pg-config');
const { CAMEL_CASE, PAGINATION } = require('../../engine/global');
const { PASSWORD_HASH } = require('../../engine/password');

dotenv.config();

const USERS = {
    findAll: async (req, res) => {
        let FILTERS = "";

        if (req.query.userId) {
            FILTERS += " AND user_id='" + req.query.userId + "' ";
        }

        if (req.query.search) {
            FILTERS += " AND LOWER(fullname)='" + req.query.search.toLowerCase() + "' OR " +
                " LOWER(username)='" + req.query.search.toLowerCase() + "' OR " +
                " LOWER(email)='" + req.query.search.toLowerCase() + "' OR " +
                " LOWER(phone)='" + req.query.search.toLowerCase() + "' ";
        }

        let countResults = await CLIENT.query(`
            SELECT
                COUNT(*)
            FROM users
            WHERE isactive=true
            ${FILTERS}`
        );
        let totalData = countResults.rows[0].count;

        let LIMIT = (req.query.limit) ? " LIMIT " + parseInt(req.query.limit) : " LIMIT 10";
        let OFFSET = (req.query.limit && req.query.page) ? " OFFSET " + (parseInt(req.query.page) * parseInt(req.query.limit)) : " OFFSET 0 ";

        CLIENT.query(`
            SELECT
                user_id,
                fullname as full_name,
                username,
                email,
                phone as phone_number,
                imagefile as image_file
            FROM users
            WHERE isactive=true
            ${FILTERS}
            ORDER BY created DESC
            ${LIMIT}
            ${OFFSET}`
        ).then((results) => {
            res.json({ status: 'OK', success: true, errors: false, results: CAMEL_CASE(results.rows), meta: PAGINATION(totalData, req.query.page, req.query.limit) });
        }).catch((err) => {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        });
    },

    findById: (req, res) => {
        CLIENT.query(`
            SELECT
                user_id,
                fullname as full_name,
                username,
                '' as password,
                email,
                phone as phone_number,
                imagefile as image_file
            FROM users
            WHERE isactive=true AND
                user_id='${req.query.userId}'`
        ).then((results) => {
            res.json({ status: 'OK', success: true, errors: false, results: results.rows[0] });
        }).catch((err) => {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        });
    },

    created: (req, res) => {
        try {
            let userId = uuidv4()
            CLIENT.query(`INSERT INTO users (user_id, created, createdby, updated, updatedby, isactive, fullname, email, username, password, phone, partner_id, customer_id, merchant_id)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [
                userId,
                moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                userId,
                moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                userId,
                true,
                req.body.fullName,
                req.body.email,
                req.body.username,
                PASSWORD_HASH(req.body.password),
                req.body.phoneNumber,
                req.body.partnerId,
                req.body.customerId,
                req.body.merchantId
            ]).then(() => {
                res.json({ status: 'OK', success: true, errors: false, message: 'Berhasil', userId: userId });
            }).catch((err) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    updated: async (req, res) => {
        try {
            CLIENT.query(`UPDATE users SET updated=$1, updatedby=$2, isactive=$3, fullname=$4, phone=$5 WHERE user_id=$6`, [
                moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                req.logged.userId,
                true,
                req.body.fullName,
                req.body.phoneNumber,
                req.logged.userId
            ]).then(() => {
                res.json({ status: 'OK', success: true, errors: false, message: 'Berhasil' });
            }).catch((err) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    updatedProfle: (req, res) => {
        try {
            CLIENT.query(`UPDATE users SET updated=$1, updatedby=$2, fullname=$3, email=$4, phone=$5, username=$6 WHERE user_id='${req.logged.userId}'`, [
                moment(new Date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                req.logged.userId,
                req.body.fullName,
                req.body.email,
                req.body.phone,
                req.body.userName
            ]).then(() => {
                res.json({ status: 'OK', success: true, errors: false, message: 'Berhasil' });
            }).catch((e) => {
                res.json({ status: 'OK', success: false, errors: true, message: e.message });
            })
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    deleted: (req, res) => {
        try {
            CLIENT.query(`UPDATE users SET updated=$1, updatedby=$2, isactive=$3 WHERE user_id=$4`, [
                moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                userId,
                false,
            ]).then(() => {
                res.json({ status: 'OK', success: true, errors: false, message: 'Berhasil' });
            }).catch((err) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    uploaded: async (req, res) => {
        try {
            let filename = '';
            let checkUser = await CHECK_USERS_BY_ID(req.logged.userId);
            if (checkUser.results.imagefile) {
                if (fs.existsSync(path.join(process.env.UPLOAD_PATH, checkUser.results.imagefile))) {
                    fs.unlinkSync(path.join(process.env.UPLOAD_PATH, checkUser.results.imagefile));
                }
                filename = path.join(`/profiles/${req.logged.userId}`, req.body.imageFile);
            } else {
                filename = path.join(`/profiles/${req.logged.userId}`, req.body.imageFile);
            }

            CLIENT.query(`UPDATE users SET imagefile=$1 WHERE user_id=$2`, [
                filename,
                req.logged.userId
            ]).then(() => {
                res.json({ status: 'OK', success: true, errors: false, message: 'Berhasil' });
            }).catch((res) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });

        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    uploadImage: async (req, res) => {
        try {
            let filename = '';
            let checkUser = await CHECK_USERS_BY_ID(req.logged.userId);
            if (checkUser.results.imagefile && fs.existsSync(path.join(process.env.UPLOAD_PATH, checkUser.results.imagefile))) {
                fs.unlinkSync(path.join(process.env.UPLOAD_PATH, checkUser.results.imagefile));
            }
            CLIENT.query(`UPDATE users SET imagefile=$1 WHERE user_id=$2`, [
                process.env.CDN_URL + '/' + path.join('/profiles', req.file.filename),
                req.logged.userId
            ]).then(() => {
                res.json({ status: 'OK', success: true, errors: false, message: 'Berhasil' });
            }).catch((res) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });

        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    }
}

const CHECK_USERS_BY_ID = async (userId) => {
    try {
        let results = await CLIENT.query(`SELECT email, phone, username, password, partner_id, customer_id, merchant_id, imagefile FROM users WHERE isactive=true AND user_id='${userId}'`);
        return { success: true, errors: false, results: results.rows[0] };
    } catch (err) {
        return { success: false, errors: true, message: err.message };
    }
}

module.exports = USERS;
