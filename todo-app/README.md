# Todo App — Full-Stack (React + Node.js + PostgreSQL)

A full-stack task management application built as part of an **AI vs Manual Development Comparison** experiment.

## 🧪 Project Purpose

This app was built **twice**:

| Approach | Tools Used | Outcome |
|---|---|---|
| **Manual** | VS Code, documentation, Stack Overflow | Deep understanding of every line |
| **AI-Assisted** | Claude, Cursor, LLM prompting | 3x faster — but required critical review |

**Key finding:** AI-generated code required validation for security (SQL injection prevention, input sanitization), edge case handling, and clean code principles. AI accelerates — it doesn't replace — engineering judgment.

---

## 🚀 Features

- ✅ Create, read, update, delete (CRUD) todos
- ✅ Priority levels (High / Medium / Low) with color coding
- ✅ Due dates with calendar picker
- ✅ Toggle completion status
- ✅ Filter by status (all / pending / completed) and priority
- ✅ Stats dashboard (total, completed, pending, high priority)
- ✅ RESTful API with full error handling
- ✅ PostgreSQL with normalized schema

---

## 🛠️ Tech Stack

**Frontend:** React 18, Axios, CSS3
**Backend:** Node.js, Express.js
**Database:** PostgreSQL
**Tools:** Git, npm, dotenv

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone the repo
```bash
git clone https://github.com/Ben-habte/todo-app.git
cd todo-app
```

### 2. Set up the database
```sql
CREATE DATABASE tododb;
```

### 3. Configure environment variables
```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 4. Install dependencies
```bash
npm run install-all
```

### 5. Run the app
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

The app will be available at `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todos` | Get all todos (supports `?completed=true&priority=high`) |
| GET | `/api/todos/:id` | Get single todo |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/:id` | Update todo |
| PATCH | `/api/todos/:id/toggle` | Toggle completion |
| DELETE | `/api/todos/:id` | Delete todo |
| GET | `/api/todos/stats/summary` | Get stats |

---

## 🗄️ Database Schema

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 AI vs Manual — What I Learned

### Where AI helped:
- Generating boilerplate (Express routes, React components)
- Suggesting SQL query patterns
- Writing CSS quickly

### Where I had to intervene:
- **Security:** AI-generated queries needed parameterization checks to prevent SQL injection
- **Edge cases:** AI missed empty string validation on title field
- **Code quality:** Some AI-generated components were over-engineered — refactored for simplicity
- **Architecture:** AI suggested a flat structure; I enforced separation of concerns

> "AI is a powerful assistant, not a replacement for critical thinking." — Core lesson from this project.

---

## 👤 Author

**Benhur Rezene Habte**
- GitHub: [github.com/Ben-habte](https://github.com/Ben-habte)
- LinkedIn: [linkedin.com/in/benhur-habte](https://linkedin.com/in/benhur-habte)
