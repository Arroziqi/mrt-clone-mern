import express from 'express';
import { makeInvoker } from 'awilix-express';
import { AwilixContainer } from 'awilix';
import requireAuth from '../../middlewares/requireAuth';
import validateRequest from '../../middlewares/validateRequest';
import { applyVoucherSchema } from '../../middlewares/schemas';
import VouchersController from './vouchers.controller';

const router = express.Router();

export default (container: AwilixContainer) => {
  const api = makeInvoker<VouchersController>(() => container.resolve('vouchersController'));

  /**
   * @openapi
   * /vouchers/apply:
   *   post:
   *     tags:
   *       - Vouchers
   *     summary: Apply a voucher code
   *     description: Validates a voucher code against the calculated fare and returns discount preview.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - code
   *               - departureId
   *               - destinationId
   *               - passengers
   *             properties:
   *               code:
   *                 type: string
   *                 example: DISKON50
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
   *     responses:
   *       200:
   *         description: Voucher applied successfully
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
   *                     grossAmount:
   *                       type: number
   *                     code:
   *                       type: string
   *                     description:
   *                       type: string
   *                     discountAmount:
   *                       type: number
   *                     finalAmount:
   *                       type: number
   *       400:
   *         description: Validation error or voucher invalid
   *       404:
   *         description: Voucher not found
   */
  router.post('/apply', requireAuth, validateRequest(applyVoucherSchema), api('applyVoucher'));

  return router;
};
