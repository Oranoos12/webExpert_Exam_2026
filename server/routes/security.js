const express = require('express');
const securityController = require('../controllers/securityController');
const { authenticate } = require('../middleware/authentication');

const router = express.Router();

router.post('/login', securityController.login);
router.post('/refresh', securityController.refresh);
router.post('/logout', securityController.logout);
router.post('/login/check', authenticate, securityController.checkLogin);

module.exports = router;