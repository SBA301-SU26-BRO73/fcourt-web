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
