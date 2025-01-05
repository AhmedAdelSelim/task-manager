# Task Manager Application

A full-stack task management application with real-time updates.

## Features
- Task hierarchy (parent/child tasks)
- Real-time updates via WebSocket
- Custom fields support
- Task ownership and assignment
- Progress tracking
- RTL support
- i18n internationalization

## Tech Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL (Docker)
- Real-time: WebSocket

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository:
```

2. Start the database:
```bash
docker-compose up -d
```

3. Install backend dependencies:
```bash
cd task-manager-backend
npm install
npm run dev
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
npm start
```

### Environment Variables

Backend (.env):
```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=task_manager
DB_PASSWORD=postgres
DB_PORT=5432
NODE_ENV=development
```

## Development

The application runs on:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: localhost:5432

## Docker

Start all services:
```bash
docker-compose up -d
```

Stop all services:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs
```