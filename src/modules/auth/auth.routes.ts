import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import AuthController from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import requireAuth from '../../middlewares/requireAuth';
import { registerSchema, loginSchema, updateProfileSchema } from '../../middlewares/schemas';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<AuthController>(() => container.resolve('authController'));

  /**
   * @openapi
   * /auth/register:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Register a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fullName:
   *                 type: string
   *               email:
   *                 type: string
   *               phoneNumber:
   *                 type: string
   *               pin:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   */
  router.post('/register', validateRequest(registerSchema), api('register'));

  /**
   * @openapi
   * /auth/login:
   *   post:
   *     tags:
   *       - Auth
   *     summary: Login user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               phoneNumber:
   *                 type: string
   *               pin:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   */
  router.post('/login', validateRequest(loginSchema), api('login'));

  /**
   * @openapi
   * /auth/profile:
   *   put:
   *     tags:
   *       - Auth
   *     summary: Update user profile
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fullName:
   *                 type: string
   *               phoneNumber:
   *                 type: string
   *               email:
   *                 type: string
   *               age:
   *                 type: number
   *     responses:
   *       200:
   *         description: Profile updated successfully
   */
  router.put('/profile', requireAuth, validateRequest(updateProfileSchema), api('updateProfile'));

  /**
   * @openapi
   * /auth/account:
   *   delete:
   *     tags:
   *       - Auth
   *     summary: Delete user account
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Account successfully deleted
   */
  router.delete('/account', requireAuth, api('deleteAccount'));

  return router;
};
