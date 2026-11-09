export interface SubscriptionPlan {
  id: number;
  name: string;
  tagline?: string | null;
  /** VND; null means the plan is not sold for that billing cycle. */
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  maxCourts: number;
  maxBranches: number;
  active: boolean;
  color?: string | null;
  popular?: boolean;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** A paid period already bought that starts after the current one. */
export interface UpcomingSubscription {
  id: number;
  plan: SubscriptionPlan;
  maxCourts: number;
  maxBranches: number;
  startDate: string;
  endDate: string;
}

/** Current resource usage of the owner; null/absent when facility-service is unavailable. */
export interface SubscriptionUsage {
  branchesUsed: number;
  courtsUsed: number;
}

export interface Subscription {
  id: number;
  adminId: number;
  plan: SubscriptionPlan;
  maxCourts: number;
  maxBranches: number;
  startDate: string;
  endDate: string;
  /** Today is within the dates. */
  active: boolean;
  /** The free subscription given before any purchase. */
  starter: boolean;
  upcoming: UpcomingSubscription[];
  usage?: SubscriptionUsage | null;
}

export interface SubscribeRequest {
  planId: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
}

export type SubscriptionPaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'FAILED'

export interface SubscriptionPayment {
  id: number
  orderCode: number
  planId: number
  planName: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  amount: number
  status: SubscriptionPaymentStatus
  checkoutUrl?: string | null
  qrCode?: string | null
  expiredAt: string
  paidAt?: string | null
  subscriptionActive: boolean
}
