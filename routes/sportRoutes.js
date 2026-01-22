const express = require('express');
const router = express.Router();
const {
  getSports,
  createSport,
  updateSport,
  deleteSport,
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament
} = require('../controllers/sportController');
const { protect } = require('../middleware/auth');

// Sports routes
router.get('/', getSports);
router.post('/', protect, createSport);
router.put('/:id', protect, updateSport);
router.delete('/:id', protect, deleteSport);

// Tournament routes
router.get('/tournaments', getTournaments);
router.get('/tournaments/:id', getTournamentById);
router.post('/tournaments', protect, createTournament);
router.put('/tournaments/:id', protect, updateTournament);
router.delete('/tournaments/:id', protect, deleteTournament);

module.exports = router;