const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

router.post
(
    '/signup',
    userController.createUser,
);

router.put
(
    '/activateAccount',
    userController.userAccountActivation
);

router.post
(
    '/signin',
    userController.loginUser
);

module.exports = router;
