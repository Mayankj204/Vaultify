const express = require('express');
const cors = require('cors');
require('dotenv').config();

const fileRoutes = require('./routes/files');
const shareRoutes = require('./routes/shares');
const metaRoutes = require('./routes/meta');

const app = express();
const port = process.env.PORT || 3001;

// --- THIS IS THE FIX ---
// Configure CORS to allow requests from your deployed frontend
const allowedOrigins = [
  'http://localhost:3000', // For local development
  'https://vaultify-app.onrender.com' // **REPLACE THIS with your deployed frontend URL**
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
// --------------------

app.use(express.json());

app.use('/api/files', fileRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/meta', metaRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});