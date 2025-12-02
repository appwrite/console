import { BillingPlan } from '@appwrite.io/console';

export function isFreePlan(plan: BillingPlan | string): boolean {
    switch (plan) {
        case BillingPlan.Imaginetier0:
        case BillingPlan.Tier0:
            return true;
        default:
            return false;
    }
}
