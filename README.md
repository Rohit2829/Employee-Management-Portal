# 🏢 Employee Management Portal

A full-stack **Employee Management System** built with **React + TypeScript** on the frontend and **Node.js + Express + Sequelize** on the backend. Features employee management, health tracking, role-based access control, OAuth (Microsoft), Swagger API docs, and more.

---

## ✨ Features

- 👥 **Employee Management** — Add, view, update, and delete employee records
- 🏥 **Health Tracker** — Monitor employee health records and sick leaves
- 🔐 **Authentication** — JWT-based auth + Microsoft OAuth (Passport.js)
- 🛡️ **Role & Privilege System** — Granular role-based access control
- 📊 **Dashboard** — Visual analytics with charts (Chart.js / Recharts)
- 📧 **Email Notifications** — Automated emails via Nodemailer
- 🔄 **Rotation Scheduler** — Automated employee rotation with cron jobs
- 📖 **Swagger API Docs** — Auto-generated REST API documentation
- 🪵 **Winston Logging** — Structured logging with configurable log levels

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React | ^19 |
| TypeScript | ~6.0 |
| Vite | ^8.0 |
| Ant Design (antd) | ^6.0 |
| React Router DOM | ^7.0 |
| Axios | ^1.0 |
| Recharts / Chart.js | Latest |

### Backend
| Technology | Version |
|---|---|
| Node.js | >=18 |
| Express | ^4.19 |
| TypeScript | ^5.4 |
| Sequelize ORM | ^6.37 |
| MySQL2 | ^3.11 |
| JWT | ^9.0 |
| Passport.js | ^0.7 |
| Swagger Auto-gen | ^2.23 |
| Winston | ^3.14 |
| Nodemailer | ^6.9 |
| Node-Cron | ^3.0 |

---

## 📁 Project Structure

```
Employee-Management-Portal/
├── frontend/               # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API service layer
│   │   └── types/          # TypeScript type definitions
│   └── package.json
│
├── backend/                # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # Express routes
│   │   ├── middlewares/    # Auth & validation middleware
│   │   ├── migrations/     # Database migrations
│   │   ├── config/         # App configuration
│   │   └── utils/          # Helper utilities
│   ├── .env.example        # Environment variable template
│   └── package.json
│
├── database/               # SQL schema & seed files
│   └── employee.sql
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **npm** >= 9.x

---

### 1. Clone the Repository

```bash
git clone https://github.com/Rohit2829/Employee-Management-Portal.git
cd Employee-Management-Portal
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql

PORT=3005
APP_NAME=EmployeePortal

JWT_SECRET_KEY=your_strong_jwt_secret
JWT_ISSUER=localhost:3005
JWT_AUDIENCE=localhost:3005
ENCRYPT_KEY=your_encrypt_key

MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

Run database migrations:

```bash
npm run upMigration
```

Start the backend dev server:

```bash
npm run dev
```

> Backend runs at: **http://localhost:3005**  
> Swagger docs at: **http://localhost:3005/api-docs**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs at: **http://localhost:5173**

---

## 📖 API Documentation

Once the backend is running, visit **[http://localhost:3005/api-docs](http://localhost:3005/api-docs)** for the full Swagger UI with all available endpoints.

---

## 🗄️ Database

Import the base schema from `database/employee.sql` into your MySQL instance:

```bash
mysql -u root -p your_database_name < database/employee.sql
```

---

## 📜 Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript & generate Swagger |
| `npm start` | Run compiled production build |
| `npm run upMigration` | Run pending database migrations |
| `npm run downMigration` | Rollback last migration |
| `npm run swagger` | Regenerate Swagger docs |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Rohit Yadav**  
GitHub: [@Rohit2829](https://github.com/Rohit2829)  
Email: rohityadav635023@gmail.com
