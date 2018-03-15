import { Conflict, NotFound, BadRequest } from './errors';

const fundingTimestamps = {};

const promoCodeRegex = /^[0-9]{4}-[0-9]{4}-[0-9]{4}$/i;
const emailRegex = /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default class Faucet {
  constructor(db, logger) {
    this.db = db;
    this.logger = logger;
  }

  async claimPromoCode(promoCode, email) {
    const errors = {};
    if (!promoCodeRegex.test(promoCode)) {
      errors.promoCode = 'Promo code is not vaild. Please try again.';
    }

    if (!emailRegex.test(email)) {
      errors.email = 'Email is not vaild. Please try again.';
    }

    if (errors.email || errors.promoCode) {
      return { status: 'error', errors };
    }

    const emailCodes = await this.db.getCodesByEmail(email);
    this.logger.log('emailCodes', { extra: { emailCodes} });
    if (emailCodes.length > 0) {
      return {
        status: 'error',
        errors: {
          email: 'You have already claimed promo code for this email',
        }
      };
    }

    const dbCode = await this.db.getPromoCode(promoCode);

    if (!dbCode || dbCode.email) {
      return {
        status: 'error',
        errors: {
          promoCode: 'Promo code is not vaild. Please try again.',
        }
      };
    }

    await this.db.setPromoCodeEmail(promoCode, email);

    return { status: 'success' };
  }
}
