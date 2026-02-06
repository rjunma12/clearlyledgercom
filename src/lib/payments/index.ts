/**
 * Payment System - Provider-Agnostic Payment Abstraction Layer
 * 
 * This module exports all payment-related types, interfaces, and utilities.
 * Use these to integrate with any payment provider in a consistent way.
 * 
 * @example
 * ```typescript
 * import { PaymentProvider, PaymentError, PaymentErrorCode } from '@/lib/payments';
 * 
 * // Implement a payment provider
 * class StripeProvider implements PaymentProvider {
 *   // ... implementation
 * }
 * ```
 */

// Types
export type {
  BillingInterval,
  SubscriptionStatus,
  CheckoutParams,
  CheckoutResult,
  SubscriptionDetails,
  WebhookVerificationParams,
  ParsedWebhookEvent,
  CustomerData,
  PaymentProviderConfig,
} from './types';

// Provider interface
export type { PaymentProvider } from './PaymentProvider';
export {
  PaymentProviderNotConfiguredError,
  PaymentOperationError,
} from './PaymentProvider';

// Events
export type {
  PaymentWebhookEventType,
  StandardWebhookEvent,
  WebhookEventHandler,
  WebhookEventHandlerMap,
} from './events';
export {
  processWebhookEvent,
  getEventTypeDescription,
} from './events';

// Errors
export {
  PaymentErrorCode,
  PaymentError,
  createPaymentError,
  isPaymentError,
} from './errors';
