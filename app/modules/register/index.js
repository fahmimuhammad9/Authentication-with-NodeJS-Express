'use strict';

const moment        = require('moment');
const { v4:uuidv4 } = require('uuid');
const { CLIENT }    = require('../../config/pg-config');
const { VALIDATION }    = require('../../engine/global');
const { PASSWORD_HASH } = require('../../engine/password');

const REGISTER = {
    created: async (req, res) => {
        try {
            if (VALIDATION(req.body) === false) {
                let exists = await CHECK_USERS_BY_EMAIL(req.body.email);
                if (exists.success === true && exists.isExists === false) {
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
                        req.body.phone,
                        req.body.partnerId,
                        req.body.customerId,
                        req.body.merchantId
                    ]).then(() => {
                        res.json({status:'OK', success:true, errors:false, userId:userId, message:'Berhasil'});
                    }).catch((err) => {
                        res.json({status:'OK', success:false, errors:true, message:err.message});
                    });
                } else {
                    res.json({status:'OK', success:false, errors:true, message:'Alamat email sudah terdaftar'});
                }
            } else {
                res.json({status:'OK', success:false, errors:true, message:'Field harus diisi'})
            }
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    },

    addMerchant: (req, res) => {
        try {
            CLIENT.query(`UPDATE users SET merchant_id=$1 WHERE user_id=$2`, [
                req.body.merchantId,
                req.body.userId
            ]).then(() => {
                res.json({status:'OK', success:true, errors:false, message:'Berhasil'});
            }).catch((err) => {
                res.json({status:'OK', success:false, errors:true, message:err.message});
            })
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    }
}

const CHECK_USERS_BY_EMAIL = async (email) => {
    try {
        let results = await CLIENT.query(`
            SELECT
                COUNT(*)
            FROM users
            WHERE isactive=true AND
                email='${email}'`
        );
        return {success:true, errors:false, isExists:(results.rows[0].count > 0) ? true : false};
    } catch(err) {
        return {success:false, errors:true, message:err.message};
    }
}

module.exports = REGISTER;
