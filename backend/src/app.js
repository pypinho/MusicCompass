
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const genreRoutes = require('./api/routes/genres');
const artistRoutes = require('./api/routes/artists');

app.use('/api/genres', genreRoutes);
app.use('/api/artists', artistRoutes);

// Error Handling

module.exports = app;
