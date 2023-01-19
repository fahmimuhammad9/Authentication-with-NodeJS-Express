'use strict';

const { CLIENT } = require('../../config/pg-config');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const ROLES = {
    createPermission: (req, res) => {
        let q = 'INSERT INTO roles_permission (roles_permission_id, created, createdby, updated, updatedby, isactive, name, service_id)'
            + 'values ($1, $2, $3, $4, $5, $6, $7, $8)';
        let permissionId = uuidv4();
        CLIENT.query(q, [
            permissionId,
            moment(new Date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
            req.logged.partnerId,
            moment(new Date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
            req.logged.partnerId,
            true,
            req.body.name.toLowerCase(),
            res.body.service_id
        ]).then(() => {
            return res.json({ status: 200, success: true, message: 'Berhasil menambah Permission' });
        }).catch((e) => {
            return res.json({ status: 200, success: false, message: e.message });
        })
    },

    readPermission: (req, res) => {
        CLIENT.query(`SELECT pa_permission_id as permission_id, name FROM pa_permission WHERE isactive=TRUE`).then((results) => {
            return res.json({ status: 200, success: true, results: results.rows });
        }).catch((e) => {
            return res.json({ status: 200, success: false, message: e.message });
        })
    },

    deletePermission: (req, res) => {
        CLIENT.query(`UPDATE pa_permission SET isactive=FALSE where pa_permission_id='${req.query.permission_id}'`).then(() => {
            CLIENT.query(`UPDATE pa_roles SET isactive=false WHERE pa_permission_id='${req.query.permission_id}'`).then(() => {
                return res.json({ status: 200, success: true, message: 'Berhasil menghapus Permission' });
            }).catch((err) => {
                return res.json({ status: 200, success: false, message: err.message });
            })
        }).catch((e) => {
            return res.json({ status: 200, success: false, message: e.message });
        })
    },

    createRole: async (req, res) => {
        let check = await CLIENT.query(`SELECT * FROM pa_roles WHERE s_user_id='${req.body.user_id}' AND pa_permission_id='${req.body.permission_id}'`);
        if (check.rowCount > 0) {
            return res.json({ status: 200, success: false, message: 'Roles telah terdaftar' });
        }
        let q = 'INSERT INTO pa_roles (pa_roles_id, created, createdby, updated, updatedby, isactive, s_user_id, pa_permission_id) '
            + 'values ($1, $2, $3, $4, $5, $6, $7, $8)';
        let roleId = uuidv4();
        CLIENT.query(q, [
            roleId,
            moment(new Date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
            req.logged.partnerId,
            moment(new Date).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
            req.logged.partnerId,
            true,
            req.body.user_id,
            req.body.permission_id
        ]).then(() => {
            return res.json({ status: 200, success: true, message: 'Berhasil menambahkan Roles' });
        }).catch((e) => {
            return res.json({ status: 200, success: false, message: e.message });
        })
    },

    readRoles: (req, res) => {
        CLIENT.query(`
        SELECT
            pr.pa_roles_id as roles_id,
            pr.s_user_id AS user_id,
            pr.pa_permission_id AS permission_id,
            pp."name" as roles  
        FROM
            pa_roles pr
        LEFT JOIN pa_permission pp ON
            pp.pa_permission_id = pr.pa_permission_id 
        WHERE
            pr.isactive = TRUE`
        ).then((results) => {
            Promise.all(
                results.rows.map(async (val) => {
                    req.query.userId = val.user_id
                    let userinfo = await (await USER_LIST(req)).results[0];
                    val.fullname = userinfo.fullName,
                        val.username = userinfo.username,
                        val.email = userinfo.email,
                        val.phonenumber = userinfo.phoneNumber
                    return val;
                })
            ).then((data) => {
                return res.json({ status: 200, success: true, results: data });
            })
        }).catch((e) => {
            return req.json({ status: 200, success: false, message: e.message });
        })
    },

    deleteRoles: (req, res) => {
        CLIENT.query(`UPDATE pa_roles SET isactive=FALSE WHERE pa_roles_id='${req.query.roles_id}'`).then(() => {
            return res.json({ status: 200, success: true, message: 'Berhasil menghapus Roles' });
        }).catch((e) => {
            return res.json({ status: 200, success: false, message: e.message });
        })
    }

}

module.exports = ROLES;