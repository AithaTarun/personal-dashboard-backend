const express = require('express');
const multer = require("multer");

const checkAuthentication = require('../middlewares/check-authentication');

const router = express.Router();

const fileController = require('../controllers/filesUpload');

let multerStorage = multer();

const jwt = require('jsonwebtoken');

router.post
(
    '/upload',
    checkAuthentication,
    (request, response, next)=>
    {
        // Defining files storage directory
        const token = request.token;

        const decodedToken = jwt.decode(token);

        multerStorage = multer({ dest: '../storage/' + decodedToken.userId });

        next();
    },

    multerStorage.single('uploadFiles'),  // Multer middleware to fetch file and store in request.file.

    fileController.uploadFiles
);

router.get
(
    '/getFilesDetails',
    checkAuthentication,
    fileController.getFilesDetails
);

router.get
(
    '/getFile/:fileName',
    checkAuthentication,
    fileController.getFile
)

router.delete
(
    '/deleteFile/:fileName',
    checkAuthentication,
    fileController.deleteFile
)

module.exports = router;
