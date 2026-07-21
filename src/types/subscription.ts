export interface SubscriptionPlan {
  id: number;
  name: string;
  tagline?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxCourts: number;
  maxBranches: number;
  active: boolean;
  color?: string;
  popular?: boolean;
  features?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: number;
  adminId: number;
  adminEmail: string;
  adminName: string;
  plan: SubscriptionPlan;
  maxCourts: number;
  maxBranches: number;
  startDate: string;
  endDate: string;
  active: boolean;
  currentBranchCount?: number;
  currentCourtCount?: number;
}

export interface SubscribeRequest {
  planId: number;
  billingCycle?: 'MONTHLY' | 'YEARLY';
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
  checkoutUrl?: string
  qrCode?: string
  expiredAt: string
  paidAt?: string
  subscriptionActive: boolean
}
