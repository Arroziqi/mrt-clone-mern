import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import requireAuth from '../../middlewares/requireAuth';
import TicketsController from './tickets.controller';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<TicketsController>(() => container.resolve('ticketsController'));
  
  router.use(requireAuth);
  
  router.post('/checkout', api('checkout'));
  router.post('/pay', api('pay'));

  /**
   * @openapi
   * /tickets/active:
   *   get:
   *     tags:
   *       - Tickets
   *     summary: Get active tickets
   *     description: Returns a list of all active tickets for the authenticated user (no pagination).
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Active tickets retrieved successfully
   */
  router.get('/active', api('getActive'));

  /**
   * @openapi
   * /tickets/history:
   *   get:
   *     tags:
   *       - Tickets
   *     summary: Get used ticket history
   *     description: Returns paginated used ticket history for the authenticated user.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *     responses:
   *       200:
   *         description: Used ticket history retrieved successfully
   */
  router.get('/history', api('getUsedHistory'));

  /**
   * @openapi
   * /tickets/{id}:
   *   get:
   *     tags:
   *       - Tickets
   *     summary: Get ticket detail
   *     description: Returns the details of a single ticket by its ID.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Ticket details retrieved successfully
   *       404:
   *         description: Ticket not found
   */
  router.get('/:id', api('getDetail'));
  
  
  return router;
};
