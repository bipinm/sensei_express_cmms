# CMMS App - AI-Powered Maintenance Management System

![License](https://img.shields.io/badge/Educational-Nikhil_&_Bipin-blue)
![Frontend](https://img.shields.io/badge/Frontend-Angular_21-red)
![Backend](https://img.shields.io/badge/Backend-Express.js-green)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

> Note: Created as part of the `5-Day AI Agents Intensive Course with Google` learning project.

## 🎯 Overview

This project is a **Computerized Maintenance Management System (CMMS)** built to showcase AI-powered capabilities in maintenance and asset management. The code is approximately 99% AI-generated and is designed for educational purposes as part of the `5day-googleai-agents` project.

## Features

- 🔐 **Authentication & Authorization**: JWT-based secure authentication
- 🏗️ **Asset Management**: Track and manage physical assets
- 🎫 **Ticket System**: Create and manage maintenance tickets
- 📋 **Work Order Management**: Plan, schedule, and track work orders
- 📊 **Work Activities**: Log and track maintenance activities
- 📎 **Attachments**: Upload and manage files for tickets and work orders
- 🤖 **AI Agents Integration**: Calls APIs from `5day-googleai-agents` app for agentic flows

## Project Structure

```
sensei_express_cmms/
├── backend/
│   ├── src/
│   │   ├── app.js              # Main application entry point
│   │   ├── config/             # Database and configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, error handling, uploads
│   │   ├── models/             # Sequelize models
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # AI agent services
│   │   └── utils/              # Utilities and helpers
│   ├── data/                   # CSV seed data
│   └── scripts/                # Data loading scripts
│
└── frontend/
    └── src/
        ├── app/
        │   ├── components/     # UI components
        │   ├── core/           # Auth guards and interceptors
        │   └── services/       # Angular services
        └── styles.scss         # Global styles
```

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v11.6.0 or higher)
- **PostgreSQL** (v12 or higher)
- **Python 3** (Optional: for demo data)
- **Git**
- [5day-googleai-agents](https://github.com/bipinm/5day-googleai-agents) application running for AI agent services

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sensei_express_cmms
```

### 2. Backend Setup

- Navigate to the backend directory and install dependencies
```bash
cd backend

# Install dependencies
npm install
```

- Create a .env file by copying .env.sample and updating values


- Load initial demo data to postgres (optional)
```bash
cd scripts
python3 load_data.py
cd ..
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev    # Development mode with nodemon
# OR
npm start      # Production mode
```

The backend API will be available at `http://localhost:3000`

### Start the Frontend Application

```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset

### Tickets
- `GET /api/tickets` - List all tickets
- `POST /api/tickets` - Create new ticket

### Work Orders
- `GET /api/work-orders` - List all work orders
- `POST /api/work-orders` - Create new work order

### Work Activities
- `GET /api/work-activities` - List all work activities
- `POST /api/work-activities` - Create new work activity

### Other Resources
- `/api/attachments` - File attachments
- `/api/persons` - Person management
- `/api/skills` - Skills management

## Data Model

The application manages the following core entities:

- **Assets**: Physical equipments/items requiring maintenance
- **Tickets**: Maintenance requests and issues
- **Work Orders**: Planned maintenance of an asset
- **Persons**: Users and maintenance personnel
- **Skills**: Competencies and certifications required to finish a task
- **Work Activities**: Detailed break-down of maintenance work
- **Attachments**: Associated files and documents

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Known Limitations

- ⚠️ **This is an educational project.** and must be used accordingly
- AI-generated code may contain bugs

## Contributing

This is an educational project. Feel free to fork and experiment!

## License

Educational use only - Created by Nikhil Bipin

## Acknowledgments

- Generated as part of the Google AI Agents workshop
- Built with AI assistance (~99% AI-generated code)
- Angular Material for UI components
- Express.js for backend framework
- PostgreSQL for data persistence
- And finally, 2 BIG 🧠🧠

---

**Disclaimer**: This project is for educational purposes only. Use at your own risk.

