const express = require('express');
const playerController = require('../controllers/playerController');
const { authenticate, authorize } = require('../middleware/authentication');

const router = express.Router();

// Alleen voor player. De id van de speler komt uit het JWT-token.
router.get('/predictions', authenticate, authorize(['player']), playerController.getPredictions);
router.get('/ranking', authenticate, authorize(['player']), playerController.getRanking);

module.exports = router;