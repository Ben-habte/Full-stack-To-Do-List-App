import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = '/api/todos';

const PRIORITY_COLORS = { high: '#e74c3c', medium: '#f39c12', low: '#27ae60' };

function App() {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchTodos = async () => {
    try {
      const params = {};
      if (filter === 'completed') params.completed = true;
      if (filter === 'pending') params.completed = false;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      const res = await axios.get(API, { params });
      setTodos(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load todos. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/stats/summary`);
      setStats(res.data);
    } catch {}
  };

  useEffect(() => { fetchTodos(); fetchStats(); }, [filter, priorityFilter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await axios.post(API, form);
      setForm({ title: '', description: '', priority: 'medium', due_date: '' });
      fetchTodos(); fetchStats();
    } catch (err) {
      setError('Failed to add todo.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API}/${id}/toggle`);
      fetchTodos(); fetchStats();
    } catch { setError('Failed to update todo.'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      fetchTodos(); fetchStats();
    } catch { setError('Failed to delete todo.'); }
  };

  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditForm({ title: todo.title, description: todo.description || '', priority: todo.priority, due_date: todo.due_date || '' });
  };

  const handleEdit = async (id) => {
    try {
      await axios.put(`${API}/${id}`, editForm);
      setEditId(null);
      fetchTodos();
    } catch { setError('Failed to update todo.'); }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Todo App</h1>
        <div className="stats-bar">
          <span>Total: <b>{stats.total || 0}</b></span>
          <span>✅ Done: <b>{stats.completed || 0}</b></span>
          <span>⏳ Pending: <b>{stats.pending || 0}</b></span>
          <span>🔴 High Priority: <b>{stats.high_priority_pending || 0}</b></span>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="add-section">
        <h2>Add New Task</h2>
        <form onSubmit={handleAdd} className="add-form">
          <input
            type="text" placeholder="Task title *" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required
          />
          <input
            type="text" placeholder="Description (optional)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">🟢 Low Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="high">🔴 High Priority</option>
          </select>
          <input
            type="date" value={form.due_date}
            onChange={e => setForm({ ...form, due_date: e.target.value })}
          />
          <button type="submit" className="btn-primary">Add Task</button>
        </form>
      </section>

      <section className="filter-section">
        <div className="filters">
          <div>
            <label>Status: </label>
            {['all', 'pending', 'completed'].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
          <div>
            <label>Priority: </label>
            {['all', 'high', 'medium', 'low'].map(p => (
              <button key={p} className={`filter-btn ${priorityFilter === p ? 'active' : ''}`}
                onClick={() => setPriorityFilter(p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="todos-section">
        {loading ? <p>Loading...</p> : todos.length === 0 ? (
          <p className="empty-msg">No tasks found. Add one above!</p>
        ) : (
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editId === todo.id ? (
                  <div className="edit-form">
                    <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                    <input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                    <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input type="date" value={editForm.due_date} onChange={e => setEditForm({ ...editForm, due_date: e.target.value })} />
                    <button onClick={() => handleEdit(todo.id)} className="btn-primary">Save</button>
                    <button onClick={() => setEditId(null)} className="btn-secondary">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="todo-main">
                      <input type="checkbox" checked={todo.completed} onChange={() => handleToggle(todo.id)} />
                      <div className="todo-content">
                        <span className="todo-title">{todo.title}</span>
                        {todo.description && <span className="todo-desc">{todo.description}</span>}
                        <div className="todo-meta">
                          <span className="priority-badge" style={{ background: PRIORITY_COLORS[todo.priority] }}>
                            {todo.priority}
                          </span>
                          {todo.due_date && <span className="due-date">📅 {new Date(todo.due_date).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button onClick={() => startEdit(todo)} className="btn-edit">✏️ Edit</button>
                      <button onClick={() => handleDelete(todo.id)} className="btn-delete">🗑️ Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
