export enum AuthMessages {
  INVALID_CREDENTIALS = 'ایمیل یا رمز عبور اشتباه است',
}

export enum UserMessages {
  USER_NOT_FOUND = 'کاربر پیدا نشد',
  USER_ALREADY_EXISTS = 'این ایمیل قبلاً ثبت شده است',
}

export enum PaymentMessages {
  PAYMENT_NOT_FOUND = 'پرداخت پیدا نشد',
  ORDER_NOT_FOUND = 'سفارش پیدا نشد',
  ORDER_ALREADY_PAID = 'این سفارش قبلاً پرداخت شده است',
  PAYMENT_CANCELLED = 'پرداخت لغو یا ناموفق بود',
  PAYMENT_VERIFICATION_FAILED = 'تأیید پرداخت ناموفق بود',
  PAYMENT_SUCCESS = 'پرداخت با موفقیت انجام شد',
  WALLET_NOT_FOUND = 'کیف پول پیدا نشد',
  WALLET_INSUFFICIENT_BALANCE = 'موجودی کیف پول برای پرداخت کافی نیست',
  WALLET_PAYMENT_SUCCESS = 'پرداخت با کیف پول با موفقیت انجام شد',
  WALLET_DEPOSIT_ALREADY_PROCESSED = "پرداخت از قبل پردازش شده",
  IDEMPOTENCY_KEY_REQUIRED = 'کلید پرداخت الزامی است',
  PAYMENT_ALREADY_PROCESSED = 'این درخواست پرداخت قبلاً پردازش شده است',
  PAYMENT_ALREADY_IN_PROGRESS = 'برای این سفارش یک پرداخت در حال انجام است',
  PAYMENT_EXPIRED = "درخواست پرداخت منقضی شده"
}
export enum ZarinPalMessages {
  REQUEST_FAILED = 'خطا در ایجاد درخواست پرداخت',
  VERIFICATION_FAILED = 'خطا در تأیید پرداخت',
}

export enum ProductMessages {
  PRODUCT_CREATED = 'محصول با موفقیت ایجاد شد',
  PRODUCT_REMOVED = 'محصول با موفقیت حذف شد',
  PRODUCT_UPDATED = 'محصول با موفقیت آپدیت شد',
  PRODUCT_NOT_FOUND = 'محصول پیدا نشد',
}

export enum OrderMessages {
  ORDER_NOT_FOUND = 'سفارش پیدا نشد',
  PRODUCT_NOT_FOUND = 'محصول پیدا نشد',
  PRODUCT_NOT_ACTIVE = 'محصول فعال نیست',
}

export enum WalletMessages {
  WALLET_DEPOSIT_NOT_FOUND = 'پرداخت شارژ کیف پول پیدا نشد',

  WALLET_DEPOSIT_CANCELLED = 'پرداخت شارژ کیف پول لغو یا ناموفق بود',

  WALLET_DEPOSIT_VERIFICATION_FAILED = 'تأیید پرداخت شارژ کیف پول ناموفق بود',

  WALLET_DEPOSIT_SUCCESS = 'کیف پول با موفقیت شارژ شد',

  WALLET_DEPOSIT_ALREADY_PROCESSED = 'این پرداخت قبلاً تأیید شده است',

  WALLET_NOT_FOUND = 'کیف پول پیدا نشد',
}
