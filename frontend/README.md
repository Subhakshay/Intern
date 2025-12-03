#  Task Manager Application

A modern, responsive, and scalable Full Stack Web Application built for the **Frontend Developer Intern** assignment. This application features secure JWT authentication, a dynamic dashboard with real-time task tracking, and a robust RESTful API.

## 🔗 Live Demo
- **Frontend (Vercel):** [https://intern-six-delta.vercel.app/]
- **Backend (Render):** [https://intern-1u6c.onrender.com]

---

##  Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt
- **Deployment:** Render

---

##  Key Features
- ** Secure Authentication:** User registration and login with encrypted passwords and JWT session management.
- ** Dynamic Dashboard:** Tasks are automatically sorted into **Pending**, **Completed**, and **Missed** columns.
- ** Auto-Status Updates:** The system automatically detects overdue tasks and marks them as "Missed".
- ** Search & Sort:** Real-time filtering by task name and automatic sorting by due date (nearest deadline first).
- ** Fully Responsive:** Optimized layout for both Desktop (3-column view) and Mobile (stacked view).

---

##  Scalability Strategy

To scale this application for a production-level user base, I would implement the following strategy:

1.  **Microservices Architecture:** Decouple the **Authentication Service** from the **Task Management Service**. This allows the heavy traffic of login/signup to scale independently from CRUD operations.
2.  **Database Optimization:** Implement **Redis** for caching frequently accessed data (like User Profiles) to reduce MongoDB read operations. Use database indexing on `userId` and `dueDate` fields for faster query performance.
3.  **Frontend Optimization:** Utilize Next.js **Server Side Rendering (SSR)** for critical pages to improve SEO and initial load times. Implement a **CDN** (Content Delivery Network) to serve static assets globally.
4.  **Load Balancing:** Deploy the backend behind an Nginx load balancer to distribute traffic across multiple Node.js instances.

---

##  API Documentation

### Base URL
`https://intern-1u6c.onrender.com/api`

### Authentication
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | `{ "email": "...", "password": "..." }` |
| `POST` | `/login` | Login user & get Token | `{ "email": "...", "password": "..." }` |

### Task Management (Protected Routes)

| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Fetch all user tasks | N/A |
| `POST` | `/tasks` | Create a new task | `{ "title": "...", "description": "...", "dueDate": "..." }` |
| `PUT` | `/tasks/:id` | Update task status | `{ "status": "completed" }` |
| `DELETE` | `/tasks/:id` | Delete a task | N/A |

