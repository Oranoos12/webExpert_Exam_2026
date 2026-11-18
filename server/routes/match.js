const express = require('express');
const matchController = require('../controllers/matchController');
const { authenticate, authorize } = require('../middleware/authentication');

const router = express.Router();

// GET /matches -> admin en player
router.get('/', authenticate, authorize(['admin', 'player']), matchController.getMatches);

module.exports = router;