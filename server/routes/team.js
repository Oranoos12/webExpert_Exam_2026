const express = require('express');
const teamController = require('../controllers/teamController');
const { authenticate, authorize } = require('../middleware/authentication');

const router = express.Router();

// GET /teams -> admin en player
router.get('/', authenticate, authorize(['admin', 'player']), teamController.getTeams);

module.exports = router;