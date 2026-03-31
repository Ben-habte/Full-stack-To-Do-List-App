require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tododb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Initialize database table
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
};

initDB();

// ── ROUTES ──

// GET all todos
app.get('/api/todos', async (req, res) => {
  try {
    const { completed, priority } = req.query;
    let query = 'SELECT * FROM todos';
    const params = [];
    const conditions = [];

    if (completed !== undefined) {
      params.push(completed === 'true');
      conditions.push(`completed = $${params.length}`);
    }
    if (priority) {
      params.push(priority);
      conditions.push(`priority = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single todo
app.get('/api/todos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    const result = await pool.query(
      `INSERT INTO todos (title, description, priority, due_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title.trim(), description || null, priority || 'medium', due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, description, completed, priority, due_date } = req.body;
    const result = await pool.query(
      `UPDATE todos SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        completed = COALESCE($3, completed),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [title, description, completed, priority, due_date, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle complete
app.patch('/api/todos/:id/toggle', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE todos SET completed = NOT completed, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted successfully', todo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
app.get('/api/todos/stats/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) FILTER (WHERE completed = false) as pending,
        COUNT(*) FILTER (WHERE priority = 'high' AND completed = false) as high_priority_pending
      FROM todos
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
