import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middlewares/errorHandler';
import { scopePerRequest } from 'awilix-express';
import { container, setupContainer } from './config/container';
import { setupSwagger } from './config/swagger';
import logger from './utils/logger';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import stationsRoutes from './modules/stations/stations.routes';
import schedulesRoutes from './modules/schedules/schedules.routes';
import ticketsRoutes from './modules/tickets/tickets.routes';
import contentRoutes from './modules/content/content.routes';

const app = express();

// Initialize DI container
setupContainer();

// Setup Swagger
setupSwagger(app);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Awilix express integration (attaches a scoped container to req.container)
app.use(scopePerRequest(container));

// Routes
app.use('/api/v1/auth', authRoutes(container));
app.use('/api/v1/users', usersRoutes(container));
app.use('/api/v1/stations', stationsRoutes(container));
app.use('/api/v1/schedules', schedulesRoutes(container));
app.use('/api/v1/tickets', ticketsRoutes(container));
app.use('/api/v1/content', contentRoutes(container));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error Handler
app.use(errorHandler);

export default app;
