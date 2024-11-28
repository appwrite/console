import type { BillingPlan } from '$lib/constants';

export type Campaign = {
    $id: string;
    template: string;
    title: string;
    description: string;
    cta?: string;
    claimed?: string;
    unclaimed?: string;
    reviews?: Review[];
    image?: {
        dark: string;
        light: string;
    };
    onlyNewOrgs?: boolean;
    footer?: boolean;
    plan?: BillingPlan;
};

export type Review = {
    name: string;
    image: string;
    description: string;
    review: string;
};
