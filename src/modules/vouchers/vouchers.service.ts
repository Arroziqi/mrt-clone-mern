import { Model } from 'mongoose';
import { IVoucher } from '../../models/Voucher';
import { AppError } from '../../utils/AppError';
import logger from '../../utils/logger';

class VouchersService {
  private VoucherModel: Model<IVoucher>;

  constructor({ VoucherModel }: { VoucherModel: Model<IVoucher> }) {
    this.VoucherModel = VoucherModel;
  }

  /**
   * Validate a voucher code and return discount info.
   * Does NOT increment usageCount — that happens at payment creation time.
   */
  async validateVoucher(code: string, grossAmount: number) {
    const voucher = await this.VoucherModel.findOne({ code: code.toUpperCase(), isActive: true });

    if (!voucher) {
      throw new AppError('Voucher not found or inactive', 404);
    }

    const now = new Date();

    if (now < voucher.validFrom) {
      throw new AppError('Voucher is not yet valid', 400);
    }

    if (now > voucher.validUntil) {
      throw new AppError('Voucher has expired', 400);
    }

    if (voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit) {
      throw new AppError('Voucher usage limit reached', 400);
    }

    if (grossAmount < voucher.minTransactionAmount) {
      throw new AppError(
        `Minimum transaction amount is Rp ${voucher.minTransactionAmount.toLocaleString('id-ID')}`,
        400,
      );
    }

    const discount = this.calculateDiscount(voucher, grossAmount);

    logger.info(`Voucher ${code} validated — discount Rp ${discount}`);

    return {
      code: voucher.code,
      description: voucher.description,
      discountAmount: discount,
      finalAmount: grossAmount - discount,
    };
  }

  /**
   * Increment usage counter when a payment is actually created.
   */
  async consumeVoucher(code: string) {
    const result = await this.VoucherModel.findOneAndUpdate(
      { code: code.toUpperCase(), isActive: true },
      { $inc: { usageCount: 1 } },
      { returnDocument: 'after' },
    );
    if (!result) {
      throw new AppError('Voucher could not be consumed', 500);
    }
    return result;
  }

  /**
   * Calculate discount: supports flat amount, percentage, or percentage-with-cap.
   */
  calculateDiscount(voucher: IVoucher, grossAmount: number): number {
    let discount = 0;

    if (voucher.discountAmount !== null && voucher.discountAmount > 0) {
      // Flat discount
      discount = voucher.discountAmount;
    } else if (voucher.discountPercentage !== null && voucher.discountPercentage > 0) {
      // Percentage discount
      discount = Math.floor(grossAmount * (voucher.discountPercentage / 100));

      // Cap if maxDiscountAmount is set
      if (voucher.maxDiscountAmount !== null && voucher.maxDiscountAmount > 0) {
        discount = Math.min(discount, voucher.maxDiscountAmount);
      }
    }

    // Discount cannot exceed the gross amount
    return Math.min(discount, grossAmount);
  }
}

export default VouchersService;
