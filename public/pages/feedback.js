const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cloudcart'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Feedback POST route
app.post('/feedback', (req, res) => {
  const { rating, feedback } = req.body;

  if (!rating || !feedback) {
    return res.status(400).send('Rating and feedback are required.');
  }

  const sql = 'INSERT INTO feedback (rating, feedback) VALUES (?, ?)';
  db.query(sql, [rating, feedback], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).send('Server error');
    }
    res.send('Feedback submitted successfully!');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

