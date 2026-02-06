/**
 * Payment Error Types
 * 
 * This module defines error types for the payment system.
 * These provide consistent error handling across different payment providers.
 */

/**
 * Error codes for payment operations
 */
export enum PaymentErrorCode {
  /** Payment provider is not configured */
  PROVIDER_NOT_CONFIGURED = 'PROVIDER_NOT_CONFIGURED',
  /** Invalid API credentials */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  /** Network or connection error */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Invalid webhook signature */
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  /** Resource not found */
  NOT_FOUND = 'NOT_FOUND',
  /** Invalid request parameters */
  INVALID_REQUEST = 'INVALID_REQUEST',
  /** Payment was declined */
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  /** Card error (expired, insufficient funds, etc.) */
  CARD_ERROR = 'CARD_ERROR',
  /** Rate limit exceeded */
  RATE_LIMIT = 'RATE_LIMIT',
  /** Operation not supported by provider */
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  /** Subscription already cancelled */
  ALREADY_CANCELLED = 'ALREADY_CANCELLED',
  /** Subscription not found */
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  /** Customer not found */
  CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
  /** Plan not found */
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  /** Unknown error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Base class for payment-related errors
 */
export class PaymentError extends Error {
  public readonly code: PaymentErrorCode;
  public readonly provider?: string;
  public readonly originalError?: unknown;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    code: PaymentErrorCode,
    options?: {
      provider?: string;
      originalError?: unknown;
      isRetryable?: boolean;
    }
  ) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.provider = options?.provider;
    this.originalError = options?.originalError;
    this.isRetryable = options?.isRetryable ?? false;
  }

  /**
   * Create a user-friendly error message
   */
  toUserMessage(): string {
    const messages: Record<PaymentErrorCode, string> = {
      [PaymentErrorCode.PROVIDER_NOT_CONFIGURED]: 'Payment system is not configured. Please contact support.',
      [PaymentErrorCode.INVALID_CREDENTIALS]: 'Payment configuration error. Please contact support.',
      [PaymentErrorCode.NETWORK_ERROR]: 'Unable to connect to payment service. Please try again.',
      [PaymentErrorCode.INVALID_SIGNATURE]: 'Payment verification failed. Please contact support.',
      [PaymentErrorCode.NOT_FOUND]: 'The requested resource was not found.',
      [PaymentErrorCode.INVALID_REQUEST]: 'Invalid payment request. Please try again.',
      [PaymentErrorCode.PAYMENT_DECLINED]: 'Your payment was declined. Please try a different payment method.',
      [PaymentErrorCode.CARD_ERROR]: 'There was an issue with your card. Please check your details and try again.',
      [PaymentErrorCode.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
      [PaymentErrorCode.NOT_SUPPORTED]: 'This operation is not supported.',
      [PaymentErrorCode.ALREADY_CANCELLED]: 'This subscription is already cancelled.',
      [PaymentErrorCode.SUBSCRIPTION_NOT_FOUND]: 'Subscription not found.',
      [PaymentErrorCode.CUSTOMER_NOT_FOUND]: 'Customer not found.',
      [PaymentErrorCode.PLAN_NOT_FOUND]: 'Plan not found.',
      [PaymentErrorCode.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };

    return messages[this.code] || messages[PaymentErrorCode.UNKNOWN];
  }

  /**
   * Serialize error for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      provider: this.provider,
      isRetryable: this.isRetryable,
      stack: this.stack,
    };
  }
}

/**
 * Create a PaymentError from an unknown error
 */
export function createPaymentError(
  error: unknown,
  provider?: string
): PaymentError {
  if (error instanceof PaymentError) {
    return error;
  }

  if (error instanceof Error) {
    return new PaymentError(
      error.message,
      PaymentErrorCode.UNKNOWN,
      { provider, originalError: error }
    );
  }

  return new PaymentError(
    String(error),
    PaymentErrorCode.UNKNOWN,
    { provider, originalError: error }
  );
}

/**
 * Check if an error is a specific payment error code
 */
export function isPaymentError(
  error: unknown,
  code?: PaymentErrorCode
): error is PaymentError {
  if (!(error instanceof PaymentError)) {
    return false;
  }
  
  if (code !== undefined) {
    return error.code === code;
  }
  
  return true;
}
