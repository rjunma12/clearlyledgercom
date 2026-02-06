/**
 * Provider-agnostic payment system types
 * 
 * This module defines the core types for the payment abstraction layer.
 * These types are designed to work with any payment provider.
 */

/**
 * Billing intervals supported by the payment system
 */
export type BillingInterval = 'monthly' | 'annual' | 'lifetime';

/**
 * Subscription status values
 */
export type SubscriptionStatus = 
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'unpaid'
  | 'trialing'
  | 'expired';

/**
 * Parameters for creating a checkout session
 */
export interface CheckoutParams {
  /** The plan name to subscribe to */
  planName: string;
  /** User's email address */
  email: string;
  /** User's ID in your system */
  userId: string;
  /** URL to redirect to on successful payment */
  successUrl: string;
  /** URL to redirect to on cancelled payment */
  cancelUrl: string;
  /** Additional metadata to attach to the checkout */
  metadata?: Record<string, string>;
}

/**
 * Result of creating a checkout session
 */
export interface CheckoutResult {
  /** URL to redirect the user to for payment */
  checkoutUrl: string;
  /** Session ID for tracking the checkout */
  sessionId: string;
}

/**
 * Details about a subscription
 */
export interface SubscriptionDetails {
  /** Unique subscription ID from the provider */
  subscriptionId: string;
  /** Customer ID from the provider */
  customerId: string;
  /** Current status of the subscription */
  status: SubscriptionStatus;
  /** Plan name */
  planName: string;
  /** Display name for the plan */
  displayName: string;
  /** Billing interval */
  billingInterval: BillingInterval;
  /** When the current period started */
  currentPeriodStart: Date;
  /** When the current period ends */
  currentPeriodEnd: Date | null;
  /** Whether the subscription will cancel at period end */
  cancelAtPeriodEnd: boolean;
  /** Amount in cents */
  amountCents: number;
  /** Currency code */
  currency: string;
}

/**
 * Parameters for webhook verification
 */
export interface WebhookVerificationParams {
  /** Raw request body as string */
  payload: string;
  /** Signature header from the request */
  signature: string;
  /** Webhook signing secret */
  secret: string;
}

/**
 * Parsed webhook event data
 */
export interface ParsedWebhookEvent {
  /** Event type */
  type: string;
  /** Event ID */
  eventId: string;
  /** User ID if available */
  userId?: string;
  /** Subscription ID if applicable */
  subscriptionId?: string;
  /** Payment ID if applicable */
  paymentId?: string;
  /** Customer ID if applicable */
  customerId?: string;
  /** Plan name if applicable */
  planName?: string;
  /** Amount in cents if applicable */
  amountCents?: number;
  /** Currency if applicable */
  currency?: string;
  /** Raw event data */
  rawData: unknown;
}

/**
 * Customer data for payment provider
 */
export interface CustomerData {
  /** Customer ID from the provider */
  customerId: string;
  /** Customer email */
  email: string;
  /** Customer name */
  name?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

/**
 * Configuration required for a payment provider
 */
export interface PaymentProviderConfig {
  /** API key or secret key */
  apiKey: string;
  /** Webhook signing secret */
  webhookSecret: string;
  /** Whether to use test/sandbox mode */
  testMode: boolean;
  /** Additional provider-specific configuration */
  [key: string]: unknown;
}
