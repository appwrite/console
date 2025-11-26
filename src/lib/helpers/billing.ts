import { BillingPlan } from '@appwrite.io/console';

export function isFreePlan(plan: BillingPlan | string): boolean {
    switch (plan) {
        case BillingPlan.Imaginebasic:
        case BillingPlan.Tier0:
            return true;
        default:
            return false;
    }
}

export function isProPlan(plan: BillingPlan | string): boolean {
    switch (plan) {
        case BillingPlan.Imaginepro:
        case BillingPlan.Tier1:
            return true;
        default:
            return false;
    }
}
