'use strict';

const dotenv     = require('dotenv');
const moment     = require('moment');
const { CLIENT } = require('../../config/pg-config');
const { GENERATE_CODE } = require('../../engine/global');
const { PASSWORD_HASH, PIN_HASH } = require('../../engine/password');

dotenv.config();

const PROFILES = {
    me: (req, res) => {
        try {
            CLIENT.query(`
                SELECT
                    user_id,
                    fullname as full_name,
                    username,
                    '' as password,
                    email,
                    phone as phone_number,
                    emailverify as email_verify,
                    phoneverify as phone_verify,
                    imagefile as image_file
                FROM users
                WHERE isactive=true AND
                    user_id='${req.logged.userId}'`
            ).then((results) => {
                res.json({status:'OK', success:true, errors:false, results:results.rows[0]});
            }).catch((err) => {
                res.json({status:'OK', success:false, errors:true, message:err.message});
            });
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    },

    resetPassword: (req, res) => {
        try {
            CLIENT.query(`UPDATE users SET updated=$1, updatedby=$2, password=$3 WHERE user_id=$4`,[
                moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                userId,
                PASSWORD_HASH(req.body.newPassword),
                req.logged.userId
            ]).then(() => {
                res.json({status:'OK', success:true, errors:false, message:'Berhasil'});
            }).catch((err) => {
                res.json({status:'OK', success:false, errors:true, message:err.message});
            });
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    },

    resetPin: (req, res) => {
        try {
            let pinNumber = GENERATE_CODE(6);
            CLIENT.query(`UPDATE users SET updated=$1, updatedby=$2, pin=$3 WHERE user_id=$4`,[
                moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                userId,
                PIN_HASH(pinNumber),
                req.logged.userId
            ]).then(() => {
                res.json({status:'OK', success:true, errors:false, pinNumber:pinNumber, message:'Berhasil'});
            }).catch((err) => {
                res.json({status:'OK', success:false, errors:true, message:err.message});
            });
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    },

    verifyByEmail: (req, res) => {
        try {
            CLIENT.query(`UPDATE users SET emailverify=$1 WHERE user_id=$2`, [
                true,
                req.logged.userId
            ]).then(() => {
                res.json({status:'OK', success:true, errors:false, message:'Berhasil'});
            }).catch((err) => {
                res.json({status:'OK', success:false, errors:true, message:err.message});
            });
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    },

    verifyByPhone: (req, res) => {
        try {
            CLIENT.query(`UPDATE users SET phoneverify=$1 WHERE user_id=$2`, [
                true,
                req.logged.userId
            ]).then(() => {
                res.json({status:'OK', success:true, errors:false, message:'Berhasil'});
            }).catch((err) => {
                res.json({status:'OK', success:false, errors:true, message:err.message});
            });
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    },

    inActiveAccount: (req, res) => {
        try {
            CLIENT.query(`UPDATE users SET updated=$1, updatedby=$2, isactive=$3 WHERE user_id=$4`,[
                moment(new Date()).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
                req.logged.userId,
                false,
                req.logged.userId
            ]).then(() => {
                res.json({status:'OK', success:true, errors:false, message:'Berhasil'});
            }).catch((err) => {
                res.json({status:'OK', success:false, errors:true, message:err.message});
            });
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    },

    inActiveAccountPermanent: (req, res) => {
        try {
            CLIENT.query(`DELETE FROM users WHERE user_id=$1`, [
                req.logged.userId
            ]).then(() => {
                res.json({status:'OK', success:true, errors:false, message:'Berhasil'});
            }).catch((err) => {
                res.json({status:'OK', success:false, errors:true, message:err.message});
            });
        } catch(err) {
            res.json({status:'OK', success:false, errors:true, message:err.message});
        }
    }
}

module.exports = PROFILES;
