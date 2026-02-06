/**
 * Standard Webhook Event Types
 * 
 * This module defines the standard webhook event types that all payment
 * providers should map their events to. This provides a consistent
 * interface for handling payment events regardless of provider.
 */

/**
 * Standard payment webhook event types
 * 
 * Payment providers should map their native event types to these
 * standardized types for consistent event handling.
 */
export type PaymentWebhookEventType =
  /** Payment was successfully completed */
  | 'payment_success'
  /** Payment failed or was declined */
  | 'payment_failed'
  /** Payment is pending/processing */
  | 'payment_pending'
  /** A new subscription was created */
  | 'subscription_created'
  /** Subscription was successfully renewed */
  | 'subscription_renewed'
  /** Subscription was cancelled (may still be active until period end) */
  | 'subscription_canceled'
  /** Subscription has expired and is no longer active */
  | 'subscription_expired'
  /** Subscription payment failed (may retry) */
  | 'subscription_payment_failed'
  /** Subscription is past due */
  | 'subscription_past_due'
  /** Subscription was reactivated */
  | 'subscription_reactivated'
  /** A refund was completed */
  | 'refund_completed'
  /** A refund failed */
  | 'refund_failed'
  /** A dispute/chargeback was opened */
  | 'dispute_opened'
  /** A dispute was closed */
  | 'dispute_closed'
  /** Customer was created */
  | 'customer_created'
  /** Customer was updated */
  | 'customer_updated'
  /** Checkout session was completed */
  | 'checkout_completed'
  /** Checkout session expired without completion */
  | 'checkout_expired'
  /** Unknown or unmapped event type */
  | 'unknown';

/**
 * Standard webhook event structure
 */
export interface StandardWebhookEvent {
  /** Standardized event type */
  type: PaymentWebhookEventType;
  /** Original event type from the provider */
  originalType: string;
  /** Unique event ID from the provider */
  eventId: string;
  /** Timestamp of the event */
  timestamp: Date;
  /** Provider that sent this event */
  provider: string;
  /** User ID if identified */
  userId?: string;
  /** Subscription ID if applicable */
  subscriptionId?: string;
  /** Payment ID if applicable */
  paymentId?: string;
  /** Customer ID */
  customerId?: string;
  /** Plan name if applicable */
  planName?: string;
  /** Amount in cents if applicable */
  amountCents?: number;
  /** Currency code */
  currency?: string;
  /** Additional provider-specific data */
  metadata?: Record<string, unknown>;
  /** Raw event payload for debugging */
  rawPayload: unknown;
}

/**
 * Event handler function type
 */
export type WebhookEventHandler = (event: StandardWebhookEvent) => Promise<void>;

/**
 * Map of event types to handlers
 */
export type WebhookEventHandlerMap = Partial<Record<PaymentWebhookEventType, WebhookEventHandler>>;

/**
 * Process a webhook event using the provided handlers
 * 
 * @param event The standardized webhook event
 * @param handlers Map of event types to handler functions
 * @returns True if a handler was found and executed
 */
export async function processWebhookEvent(
  event: StandardWebhookEvent,
  handlers: WebhookEventHandlerMap
): Promise<boolean> {
  const handler = handlers[event.type];
  
  if (handler) {
    await handler(event);
    return true;
  }
  
  // Try the 'unknown' handler as a fallback
  const fallbackHandler = handlers['unknown'];
  if (fallbackHandler) {
    await fallbackHandler(event);
    return true;
  }
  
  return false;
}

/**
 * Get a human-readable description of an event type
 */
export function getEventTypeDescription(type: PaymentWebhookEventType): string {
  const descriptions: Record<PaymentWebhookEventType, string> = {
    payment_success: 'Payment completed successfully',
    payment_failed: 'Payment failed or was declined',
    payment_pending: 'Payment is being processed',
    subscription_created: 'New subscription created',
    subscription_renewed: 'Subscription renewed',
    subscription_canceled: 'Subscription cancelled',
    subscription_expired: 'Subscription expired',
    subscription_payment_failed: 'Subscription payment failed',
    subscription_past_due: 'Subscription is past due',
    subscription_reactivated: 'Subscription reactivated',
    refund_completed: 'Refund completed',
    refund_failed: 'Refund failed',
    dispute_opened: 'Dispute/chargeback opened',
    dispute_closed: 'Dispute closed',
    customer_created: 'Customer created',
    customer_updated: 'Customer updated',
    checkout_completed: 'Checkout completed',
    checkout_expired: 'Checkout session expired',
    unknown: 'Unknown event type',
  };
  
  return descriptions[type] || 'Unknown event';
}
