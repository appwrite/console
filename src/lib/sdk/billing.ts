import type { Models } from '@appwrite.io/console';

export type AllowedRegions =
    | 'fra'
    | 'nyc'
    | 'sfo'
    | 'blr'
    | 'lon'
    | 'ams'
    | 'sgp'
    | 'tor'
    | 'syd'
    | 'default'; //TODO: remove after migration

export type BillingPlansMap = Map<string, Models.BillingPlan>;
