export enum AuthMessages {
  INVALID_CREDENTIALS = 'ایمیل یا رمز عبور اشتباه است',
}

export enum UserMessages {
  USER_NOT_FOUND = 'کاربر پیدا نشد',

  USER_ALREADY_EXISTS = 'این ایمیل قبلاً ثبت شده است',
}

export enum PaymentMessages {
  PAYMENT_NOT_FOUND = 'پرداخت پیدا نشد',

  PAYMENT_CANCELLED = 'پرداخت لغو یا ناموفق بود',

  PAYMENT_VERIFICATION_FAILED = 'تأیید پرداخت ناموفق بود',

  PAYMENT_SUCCESS = 'پرداخت با موفقیت انجام شد',
}

export enum ZarinPalMessages {
  REQUEST_FAILED = 'خطا در ایجاد درخواست پرداخت',

  VERIFICATION_FAILED = 'خطا در تأیید پرداخت',
}
