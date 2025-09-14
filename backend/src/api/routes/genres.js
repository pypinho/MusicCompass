
const express = require('express');
const router = express.Router();
const { getGenres, getGenreById } = require('../controllers/genreController');

router.get('/', getGenres);
router.get('/:id', getGenreById);

module.exports = router;
