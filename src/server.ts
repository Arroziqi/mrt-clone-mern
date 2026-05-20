import 'dotenv/config';

import app from './app';
import connectDB from './config/db';
import logger from './utils/logger';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Connect to Database
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
