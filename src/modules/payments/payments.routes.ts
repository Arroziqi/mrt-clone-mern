import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import requireAuth from '../../middlewares/requireAuth';
import validateRequest from '../../middlewares/validateRequest';
import { createPaymentSchema } from '../../middlewares/schemas';
import PaymentsController from './payments.controller';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<PaymentsController>(() => container.resolve('paymentsController'));

  /**
   * @openapi
   * /payments/create:
   *   post:
   *     tags:
   *       - Payments
   *     summary: Create a payment transaction
   *     description: >
   *       Calculates fare, applies optional voucher, creates a PENDING ticket and transaction,
   *       then returns a Xendit Invoice URL.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - departureId
   *               - destinationId
   *               - passengers
   *             properties:
   *               departureId:
   *                 type: string
   *                 example: LBB
   *               destinationId:
   *                 type: string
   *                 example: DKA
   *               passengers:
   *                 type: integer
   *                 example: 1
   *               isRoundTrip:
   *                 type: boolean
   *                 default: false
   *               addOnProteksi:
   *                 type: boolean
   *                 default: false
   *               voucherCode:
   *                 type: string
   *                 description: Optional voucher code
   *     responses:
   *       201:
   *         description: Payment transaction created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     orderId:
   *                       type: string
   *                     grossAmount:
   *                       type: number
   *                     discountAmount:
   *                       type: number
   *                     finalAmount:
   *                       type: number
   *                     voucherCode:
   *                       type: string
   *                       nullable: true
   *                     invoiceUrl:
   *                       type: string
   *       400:
   *         description: Validation error
   *       502:
   *         description: Xendit gateway error
   */
  router.post('/create', requireAuth, validateRequest(createPaymentSchema), api('createPayment'));

  /**
   * @openapi
   * /payments/webhook:
   *   post:
   *     tags:
   *       - Payments
   *     summary: Xendit webhook callback
   *     description: >
   *       Receives payment notification from Xendit servers.
   *       Verifies x-callback-token, updates transaction and ticket status idempotently.
   *       This endpoint does NOT require authentication (called by Xendit).
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id:
   *                 type: string
   *               external_id:
   *                 type: string
   *               status:
   *                 type: string
   *               amount:
   *                 type: number
   *               payment_method:
   *                 type: string
   *     responses:
   *       200:
   *         description: Webhook processed
   *       403:
   *         description: Invalid signature
   *       404:
   *         description: Transaction not found
   */
  router.post('/webhook', api('handleWebhook'));

  return router;
};
