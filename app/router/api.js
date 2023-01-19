'use strict';

const express = require('express');
const API_ROUTER = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const SECURITY = require('../security');
const PROFILES = require('../modules/profiles');
const USERS = require('../modules/users');
const USER = require('../../../keyshop/app/modules/user');

// ----- DECLARE STORAGE FILE -----
const profileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        let directory = process.env.UPLOAD_PATH + '/profiles/' + req.logged.userId
        fs.mkdirSync(directory, { recursive: true });
        callback(null, directory);
    },
    filename: async (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now() + '-' + uuidv4() + path.extname(file.originalname));
    },
});

// ----- DECLARE ENDPOINT -----
API_ROUTER.route('/checkEmail').get(SECURITY.checkEmail);
API_ROUTER.route('/checkUser').get(SECURITY.checkUser);
API_ROUTER.route('/checkPhone').get(SECURITY.checkPhone);
API_ROUTER.route('/adminPass').post(SECURITY.adminAuth);

API_ROUTER.route('/logout').get(SECURITY.verify, SECURITY.logout);
API_ROUTER.route('/accounts').get(SECURITY.verify, PROFILES.me);
API_ROUTER.route('/accounts/resetPassword').put(SECURITY.verify, PROFILES.resetPassword);
API_ROUTER.route('/accounts/resetPin').put(SECURITY.verify, PROFILES.resetPin);

API_ROUTER.route('/accounts/inactive').delete(SECURITY.verify, PROFILES.inActiveAccount);
API_ROUTER.route('/accounts/delete').delete(SECURITY.verify, PROFILES.inActiveAccountPermanent);

API_ROUTER.route('/accounts/verifyEmail').post(SECURITY.verify, PROFILES.verifyByEmail);
API_ROUTER.route('/accounts/verifyPhone').post(SECURITY.verify, PROFILES.verifyByPhone);

API_ROUTER.route('/accounts/list').get(SECURITY.verify, USERS.findAll);
API_ROUTER.route('/accounts/edit').get(SECURITY.verify, USERS.findById);
API_ROUTER.route('/accounts/create').post(SECURITY.verify, USERS.created);
API_ROUTER.route('/accounts/update').put(SECURITY.verify, USERS.updated);
API_ROUTER.route('/accounts/updateprofile').put(SECURITY.verify, USERS.updatedProfle);
API_ROUTER.route('/accounts/upload').post(SECURITY.verify, USERS.uploaded);
API_ROUTER.route('/accounts/uploadimage').post(SECURITY.verify, multer({ storage: profileStorage, limits: process.env.FILES_SIZE }).single('files'), USERS.uploadImage);


module.exports = API_ROUTER;
