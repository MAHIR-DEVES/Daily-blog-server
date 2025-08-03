// server.js
require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'daily',
});

db.connect(err => {
  if (err) {
    console.error(' Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// POST API to insert blog data
app.post('/api/blogs', (req, res) => {
  const { title, category, date, readTime, image } = req.body;

  const sql = `
    INSERT INTO \`blog-list2\`(\`title\`, \`category\`, \`date\`, \`readTime\`, \`image\`) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [title, category, date, readTime, image];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Data insert failed:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({
      message: 'Blog inserted successfully',
      insertId: result.insertId,
    });

    console.log(' Data successfully added');
  });
});

//  get data
app.get('/api/blogs', (req, res) => {
  const sql = 'SELECT * FROM `blog-list2`';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Failed to fetch blogs:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(200).json(results);
  });
});

// get single data
app.get('/api/blogs/:id', (req, res) => {
  const blogId = req.params.id;

  const sql = 'SELECT * FROM `blog-list2` WHERE id = ?';
  db.query(sql, [blogId], (err, results) => {
    if (err) {
      console.error('Failed to fetch blog:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(results[0]);
  });
});

// delete
app.delete('/api/blogs/:id', (req, res) => {
  const blogId = req.params.id;
  const sql = 'DELETE FROM `blog-list2` WHERE id = ?';

  db.query(sql, [blogId], (err, result) => {
    if (err) {
      console.error('Failed to delete blog:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog deleted successfully' });
  });
});

// update

app.put('/api/blogs/:id', (req, res) => {
  const blogId = req.params.id;
  const { title, category, date, readTime, image } = req.body;

  if (!title || !category || !date) {
    return res
      .status(400)
      .json({ message: 'Title, category and date are required.' });
  }

  const sql = `
  UPDATE \`blog-list2\`
  SET title = ?,  category = ?, date = ?, readTime = ?, image = ?
  WHERE id = ?
`;

  const values = [title, category, date, readTime, image, blogId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Failed to update blog:', err.message);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ message: 'Blog updated successfully' });
  });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
