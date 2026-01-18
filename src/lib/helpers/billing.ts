import type { Models } from '@appwrite.io/console';

export function makePlansMap(
    plansArray: Models.BillingPlanList | null
): Map<string, Models.BillingPlan> {
    const plansMap = new Map<string, Models.BillingPlan>();
    if (!plansArray?.plans.length) return plansMap;

    const plans = plansArray.plans;
    for (let index = 0; index < plans.length; index++) {
        const plan = plans[index];
        plansMap.set(plan.$id, plan);
    }

    return plansMap;
}
