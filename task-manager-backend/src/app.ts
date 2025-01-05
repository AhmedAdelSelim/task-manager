import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeWebSocket } from './websocket/websocketServer';
import taskRoutes from './routes/taskRoutes';
import ownerRoutes from './routes/ownerRoutes';
import customFieldRoutes from './routes/customFieldRoutes';
import { errorHandler } from './middleware/errorHandler';
import { initializeDatabase } from './config/database';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/custom-fields', customFieldRoutes);

app.use(errorHandler);

initializeWebSocket(httpServer);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initializeDatabase();
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();