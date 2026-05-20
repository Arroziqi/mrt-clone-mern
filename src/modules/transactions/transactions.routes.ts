import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import requireAuth from '../../middlewares/requireAuth';
import TransactionsController from './transactions.controller';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<TransactionsController>(() => container.resolve('transactionsController'));

  router.use(requireAuth);

  /**
   * @openapi
   * /transactions:
   *   get:
   *     tags:
   *       - Transactions
   *     summary: Get transaction history
   *     description: Returns paginated transaction history for the authenticated user.
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
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, PAID, FAILED, EXPIRED]
   *     responses:
   *       200:
   *         description: Transaction history retrieved
   */
  router.get('/', api('getHistory'));

  /**
   * @openapi
   * /transactions/pending:
   *   get:
   *     tags:
   *       - Transactions
   *     summary: Get pending transactions
   *     description: Returns a list of all pending transactions for the authenticated user without pagination.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Pending transactions retrieved successfully
   */
  router.get('/pending', api('getPending'));

  /**
   * @openapi
   * /transactions/{orderId}:
   *   get:
   *     tags:
   *       - Transactions
   *     summary: Get transaction by order ID
   *     description: Returns a single transaction by its unique order ID.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Transaction retrieved
   *       404:
   *         description: Transaction not found
   */
  router.get('/:orderId', api('getByOrderId'));

  return router;
};
