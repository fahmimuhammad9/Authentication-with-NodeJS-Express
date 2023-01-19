"use strict";

const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { CLIENT } = require('../config/pg-config');

const { VALID_PASSWORD } = require('../engine/password');
const { CAMEL_CASE, VALIDATION, CLEAR_PREFIX_PHONE_NUMBER } = require('../engine/global');

dotenv.config()

const SECURITY = {
    auth: (req, res) => {
        try {
            if (VALIDATION({ 'email': req.body.email, 'password': req.body.password }) === false) {
                CLIENT.query(`
                    SELECT
                        user_id,
                        partner_id,
                        customer_id,
                        merchant_id,
                        password
                    FROM users
                    WHERE isactive=true AND
                        partner_id!=null OR
                        partner_id notnull AND
                        email='${req.body.email}'
                    LIMIT 1`
                ).then((results) => {
                    console.log(results.rows);
                    if (results.rows.length > 0) {
                        let isCheck = VALID_PASSWORD(req.body.password, results.rows[0].password);
                        if (isCheck === true) {
                            if (results.rows[0].partner_id) {
                                let token = jwt.sign({ userId: results.rows[0].user_id, partnerId: results.rows[0].partner_id }, process.env.JWT_SECRET)
                                res.json({ status: 'OK', success: true, errors: false, token: token });
                            }

                            if (results.rows[0].customer_id) {
                                let token = jwt.sign({ userId: results.rows[0].user_id, customerId: results.rows[0].customer_id }, process.env.JWT_SECRET)
                                res.json({ status: 'OK', success: true, errors: false, token: token });
                            }

                            if (results.rows[0].merchant_id) {
                                let token = jwt.sign({ userId: results.rows[0].user_id, merchantId: results.rows[0].marchant_id }, process.env.JWT_SECRET)
                                res.json({ status: 'OK', success: true, errors: false, token: token });
                            }
                        } else {
                            res.json({ status: 'OK', success: false, errors: true, message: 'Kata sandi tidak valid' });
                        }
                    } else {
                        res.json({ status: 'OK', success: false, errors: true, message: 'Alamat email belum terdaftar' });
                    }
                }).catch((err) => {
                    res.json({ status: 'OK', success: false, errors: true, message: err.message });
                });
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Silahkan masukan alamat email atau kata sandi anda' });
            }
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    authByUser: (req, res) => {
        try {
            if (VALIDATION({ 'username': req.body.userName, 'password': req.body.password }) === false) {
                CLIENT.query(`
                SELECT
                    user_id,
                    partner_id,
                    customer_id,
                    password,
                    username
                FROM users
                WHERE isactive=true AND
                    username='${req.body.userName}'
                LIMIT 1`
                ).then((results) => {
                    if (results.rows.length > 0) {
                        let isCheck = VALID_PASSWORD(req.body.password, results.rows[0].password);
                        if (isCheck === true) {
                            let token = jwt.sign({ userId: results.rows[0].user_id }, process.env.JWT_SECRET)
                            res.json({ status: 'OK', success: true, errors: false, token: token });
                        } else {
                            res.json({ status: 'OK', success: false, errors: true, message: 'Kata sandi tidak valid' });
                        }
                    } else {
                        res.json({ status: 'OK', success: false, errors: true, message: 'Akun pengguna belum terdaftar' });
                    }
                }).catch((err) => {
                    res.json({ status: 'OK', success: false, errors: true, message: err.message });
                });
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Silahkan masukan akun pengguna atau kata sandi anda' });
            }
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    authByEmail: (req, res) => {
        try {
            if (VALIDATION({ 'email': req.body.email, 'password': req.body.password }) === false) {
                CLIENT.query(`
                SELECT
                    user_id,
                    partner_id,
                    customer_id,
                    password,
                    email,
                    phone
                FROM users
                WHERE isactive=true AND
                    email='${req.body.email}'
                LIMIT 1`
                ).then((results) => {
                    if (results.rows.length > 0) {
                        let isCheck = VALID_PASSWORD(req.body.password, results.rows[0].password);
                        if (isCheck === true) {
                            let token = jwt.sign({ userId: results.rows[0].user_id }, process.env.JWT_SECRET)
                            res.json({ status: 'OK', success: true, errors: false, token: token });
                        } else {
                            res.json({ status: 'OK', success: false, errors: true, message: 'Kata sandi tidak valid' });
                        }
                    } else {
                        res.json({ status: 'OK', success: false, errors: true, message: 'Alamat email belum terdaftar' });
                    }
                }).catch((err) => {
                    res.json({ status: 'OK', success: false, errors: true, message: err.message });
                });
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Silahkan masukan alamat email atau kata sandi anda' });
            }
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    authByPhoneNumber: async (req, res) => {
        try {
            if (VALIDATION({ 'phoneNumber': req.body.phoneNumber, 'password': req.body.password }) === false) {
                CLIENT.query(`
                    SELECT
                        user_id,
                        password,
                        customer_id,
                        partner_id,
                        merchant_id
                    FROM (
                        SELECT
                            user_id,
                            password,
                            customer_id,
                            partner_id,
                            merchant_id,
                            CASE
                                WHEN TRIM(phone)='' or
                                    TRIM(phone)=null or
                                    TRIM(phone) isnull
                                THEN ''
                                ELSE REGEXP_REPLACE(TRIM(phone), '\\+62|\\m62|\\m0','0')
                            end phone
                        FROM users
                        WHERE isactive=true
                    )AS a
                    WHERE a.phone='${CLEAR_PREFIX_PHONE_NUMBER(req.body.phoneNumber)}'`
                ).then((results) => {
                    if (results.rows.length > 0) {
                        let isCheck = VALID_PASSWORD(req.body.password, results.rows[0].password);
                        if (isCheck === true) {
                            let token = jwt.sign({ userId: results.rows[0].user_id }, process.env.JWT_SECRET)
                            res.json({ status: 'OK', success: true, errors: false, token: token });
                        } else {
                            res.json({ status: 'OK', success: false, errors: true, message: 'Kata sandi tidak valid' });
                        }
                    } else {
                        res.json({ status: 'OK', success: false, errors: true, message: 'Nomor hp belum terdaftar' });
                    }
                }).catch((err) => {
                    res.json({ status: 'OK', success: false, errors: true, message: err.message });
                });
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Silahkan masukan nomor hp atau kata sandi anda' });
            }
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    logout: (req, res) => {
        try {
            CLIENT.query(`
                SELECT user_id
                FROM users
                WHERE isactive=true AND
                    user_id='${req.logged.userId}'`
            ).then((results) => {
                if (results.rows.length > 0) {
                    delete req.logged;
                    res.json({ status: 'OK', success: true, message: 'Berhasil keluar aplikasi' });
                }
            }).catch((err) => {
                res.json({ status: 'OK', success: false, message: err.message });
            });
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },


    check: (req, res) => {
        try {
            let token = req.body.token.split(" ");
            if (token.length > 0 && token[0] === 'Bearer') {
                jwt.verify(token[1], process.env.JWT_SECRET, (error, decode) => {
                    CLIENT.query(`
                        SELECT
                            user_id,
                            partner_id,
                            customer_id,
                            merchant_id,
                            fullname as full_name
                        FROM users
                        WHERE isactive=true AND
                            user_id='${decode.userId}'`
                    ).then((results) => {
                        if (results.rows.length > 0) {
                            res.json({ status: 'OK', success: true, errors: false, results: CAMEL_CASE(results.rows[0]) });
                        } else {
                            res.json({ status: 'OK', success: false, errors: true, message: 'Unauthorized' });
                        }
                    }).catch((err) => {
                        res.json({ status: 'OK', success: false, errors: true, message: err.message });
                    });
                });
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Unauthorized' });
            }
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: 'Unauthorized' });
        };
    },

    adminAuth: (req, res) => {
        try {
            let token = req.headers.authorization.split(" ");
            if (token.length > 0 && token[0] === 'Bearer') {
                jwt.verify(token[1], process.env.JWT_SECRET, (error, decode) => {
                    console.log(decode);
                    CLIENT.query(`SELECT password from users WHERE user_id='${decode.userId}'`).then((results) => {
                        if (results.rowCount > 0) {
                            let check = VALID_PASSWORD(req.body.password, results.rows[0].password)
                            if (check === true) {
                                res.json({ status: 'OK', success: true, errors: false, message: 'Authorization Granted' })
                            } else {
                                res.json({ status: 'OK', success: false, errors: true, message: 'Invalid Credential' });
                            }
                        } else {
                            res.json({ status: 'OK', success: false, errors: true, message: 'Invalid Token' })
                        }
                    }).catch((e) => {
                        res.json({ status: 'OK', success: false, errors: true, message: e.message })
                    })
                })
            } else {
                res.json({ status: 'OK', success: false, errors: true, message: 'Unauthorized' })
            }
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: 'Unauthorized' });
        }
    },

    verify: (req, res, next) => {
        try {
            let token = req.headers.authorization.split(" ");
            if (token.length > 0 && token[0] === 'Bearer') {
                jwt.verify(token[1], process.env.JWT_SECRET, (error, decode) => {
                    CLIENT.query(`
                        SELECT
                            user_id,
                            fullname as full_name
                        FROM users
                        WHERE isactive=true AND
                            user_id='${decode.userId}'`
                    ).then((results) => {
                        if (results.rows.length > 0) {
                            req.logged = CAMEL_CASE(results.rows[0]);
                            next();
                        }
                    }).catch((err) => {
                        res.json({ status: 'OK', success: false, message: err.message });
                    });
                });
            } else {
                res.json({ status: 'OK', success: false, message: 'Unauthorized' });
            }
        } catch (err) {
            res.json({ status: 'OK', success: false, message: 'Unauthorized' });
        };
    },

    checkUser: (req, res) => {
        try {
            CLIENT.query(`
                SELECT
                    user_id,
                    username,
                    customer_id,
                    partner_id,
                    merchant_id
                FROM users
                WHERE isactive=true AND
                username='${req.query.userName}'`
            ).then((results) => {
                res.json({ status: 'OK', success: true, errors: false, results: CAMEL_CASE(results.rows) });
            }).catch((err) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    checkEmail: (req, res) => {
        try {
            CLIENT.query(`
                SELECT
                    user_id,
                    email,
                    customer_id,
                    partner_id,
                    merchant_id
                FROM users
                WHERE isactive=true AND
                email='${req.query.email}'`
            ).then((results) => {
                res.json({ status: 'OK', success: true, errors: false, results: CAMEL_CASE(results.rows) });
            }).catch((err) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    },

    checkPhone: (req, res) => {
        try {
            CLIENT.query(`
                SELECT
                    user_id,
                    customer_id,
                    partner_id,
                    merchant_id
                FROM (
                    SELECT
                        user_id,
                        customer_id,
                        partner_id,
                        merchant_id,
                        CASE
                            WHEN TRIM(phone)='' or
                                TRIM(phone)=null or
                                TRIM(phone) isnull
                            THEN ''
                            ELSE REGEXP_REPLACE(TRIM(phone), '\\+62|\\m62|\\m0','0')
                        end phone
                    FROM users
                    WHERE isactive=true
                )AS a
                WHERE a.phone='${CLEAR_PREFIX_PHONE_NUMBER(req.query.phoneNumber)}'`
            ).then((results) => {
                res.json({ status: 'OK', success: true, errors: false, results: CAMEL_CASE(results.rows) });
            }).catch((err) => {
                res.json({ status: 'OK', success: false, errors: true, message: err.message });
            });
        } catch (err) {
            res.json({ status: 'OK', success: false, errors: true, message: err.message });
        }
    }
}

module.exports = SECURITY;
