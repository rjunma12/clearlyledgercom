/**
 * Abstract Payment Provider Interface
 * 
 * This module defines the interface that all payment providers must implement.
 * It provides a consistent API for payment operations regardless of the underlying provider.
 */

import type {
  CheckoutParams,
  CheckoutResult,
  SubscriptionDetails,
  WebhookVerificationParams,
  ParsedWebhookEvent,
  CustomerData,
  PaymentProviderConfig,
} from './types';

/**
 * Abstract interface for payment providers
 * 
 * Implement this interface to add support for a new payment provider.
 * Each method should handle provider-specific API calls and return
 * normalized data structures.
 */
export interface PaymentProvider {
  /**
   * Unique name identifier for this provider
   * @example 'stripe', 'paddle', 'lemonsqueezy'
   */
  readonly name: string;

  /**
   * Human-readable display name for this provider
   * @example 'Stripe', 'Paddle', 'Lemon Squeezy'
   */
  readonly displayName: string;

  /**
   * Whether this provider is properly configured and ready to use
   */
  readonly isConfigured: boolean;

  /**
   * Initialize the provider with configuration
   * @param config Provider-specific configuration
   */
  initialize(config: PaymentProviderConfig): Promise<void>;

  /**
   * Create a checkout session for a subscription or one-time payment
   * @param params Checkout parameters
   * @returns Checkout result with URL and session ID
   */
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult>;

  /**
   * Verify a webhook signature
   * @param params Verification parameters including payload, signature, and secret
   * @returns True if the signature is valid
   */
  verifyWebhookSignature(params: WebhookVerificationParams): Promise<boolean>;

  /**
   * Parse a webhook payload into a normalized event
   * @param payload Raw webhook payload
   * @returns Parsed webhook event
   */
  parseWebhookEvent(payload: string): Promise<ParsedWebhookEvent>;

  /**
   * Cancel a subscription
   * @param subscriptionId Provider's subscription ID
   * @param immediately If true, cancel immediately; otherwise cancel at period end
   */
  cancelSubscription(subscriptionId: string, immediately?: boolean): Promise<void>;

  /**
   * Reactivate a cancelled subscription (if still in current period)
   * @param subscriptionId Provider's subscription ID
   */
  reactivateSubscription(subscriptionId: string): Promise<void>;

  /**
   * Get subscription details
   * @param subscriptionId Provider's subscription ID
   * @returns Subscription details or null if not found
   */
  getSubscription(subscriptionId: string): Promise<SubscriptionDetails | null>;

  /**
   * Get or create a customer
   * @param email Customer email
   * @param name Optional customer name
   * @returns Customer data
   */
  getOrCreateCustomer(email: string, name?: string): Promise<CustomerData>;

  /**
   * Get the customer portal URL (if supported by provider)
   * @param customerId Provider's customer ID
   * @param returnUrl URL to redirect back to after portal session
   * @returns Portal URL or null if not supported
   */
  getCustomerPortalUrl?(customerId: string, returnUrl: string): Promise<string | null>;
}

/**
 * Error thrown when payment provider is not configured
 */
export class PaymentProviderNotConfiguredError extends Error {
  constructor(message = 'Payment provider is not configured') {
    super(message);
    this.name = 'PaymentProviderNotConfiguredError';
  }
}

/**
 * Error thrown when a payment operation fails
 */
export class PaymentOperationError extends Error {
  public readonly code: string;
  public readonly provider: string;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    code: string,
    provider: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'PaymentOperationError';
    this.code = code;
    this.provider = provider;
    this.originalError = originalError;
  }
}
