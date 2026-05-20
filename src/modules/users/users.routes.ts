import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import requireAuth from '../../middlewares/requireAuth';
import UsersController from './users.controller';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<UsersController>(() => container.resolve('usersController'));
  
  // Protect all routes
  router.use(requireAuth);
  
  /**
   * @openapi
   * /users/me:
   *   get:
   *     tags:
   *       - Users
   *     summary: Get user profile
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile returned successfully
   */
  router.get('/me', api('getProfile'));

  /**
   * @openapi
   * /users/me/activities:
   *   get:
   *     tags:
   *       - Users
   *     summary: Get user activities
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User activities returned successfully
   */
  router.get('/me/activities', api('getActivities'));
  
  router.put('/me', api('updateProfile'));
  router.get('/me/notifications', api('getNotifications'));
  router.get('/me/payment-methods', api('getPaymentMethods'));
  
  return router;
};
