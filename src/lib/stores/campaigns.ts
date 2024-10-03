//campaign welcome and startup

import { BillingPlan } from '$lib/constants';

export type CampaignData = {
    title: string;
    description: string;
    template: 'card' | 'review';
    data?: Record<string, unknown>;
    onlyNewOrgs?: boolean;
    plan?: BillingPlan;
    footer?: boolean;
};

export const campaigns: Map<string, CampaignData> = new Map();

campaigns
    .set('welcome', {
        template: 'card',
        title: "You've received $VALUE in credits",
        description:
            'Get $VALUE in credits when you upgrade or create an organization with a Pro plan.'
    })
    .set('startup', {
        template: 'card',
        title: 'Welcome to the Startups program!',
        description:
            "We're excited to have you on board. Add the coupon code to your Appwrite Scale account to join."
    })
    .set('RenderATL2024', {
        template: 'card',
        title: 'Claim your $100 RenderATL credits',
        description:
            'Get $100 in Cloud credits when you upgrade or create an organization with a Pro plan.'
    })
    .set('dealsfordevs', {
        template: 'card',
        title: 'Claim your $50 Deals For Devs credits',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan.'
    })
    .set('WelcomeManual', {
        template: 'card',
        title: 'Here is your $VALUE welcome credit!',
        description:
            'Upgrade to Appwrite Pro and add the credits to enjoy the full capabilities of Cloud.'
    })
    .set('InactiveAccounts', {
        template: 'card',
        title: 'Get everything out of Cloud. Claim your $VALUE credits.',
        description:
            'Get $VALUE in Cloud credits when you upgrade or create an organization with a Pro plan.'
    })
    .set('StartupsProgram', {
        template: 'review',
        title: 'Welcome to the Startups program',
        description:
            "We're excited to have you on board. Add your credit code to your Appwrite Scale account to join.",
        onlyNewOrgs: true,
        plan: BillingPlan.SCALE,
        data: {
            cta: 'Get everything out of Cloud with Scale',
            claimed: 'Your credits will be valid for 12 months.',
            unclaimed: 'Apply your code to join the Startups program.',
            reviews: [
                {
                    name: 'David Foster',
                    img: '1.jpeg',
                    desc: 'Managing director',
                    review: 'We really loved working with Appwrite for launching our bootstrapped "Open Mind" App. It was saving us a lot of money in comparison to Firebase since the amount of users grew quite fast and we needed a quick switch.'
                }
            ]
        }
    })
    .set('Free100', {
        template: 'review',
        title: 'Get started with $100 credits',
        description:
            'Get $100 in Cloud credits when you upgrade or create an organization with a Pro plan.',
        onlyNewOrgs: true,
        data: {
            cta: 'Get everything out of Cloud with Pro',
            claimed: 'Your credits will be valid for 3 months.',
            unclaimed: 'Apply your code to join Appwrite Pro.',
            reviews: [
                {
                    name: 'David Foster',
                    img: '1.jpeg',
                    desc: 'Managing director',
                    review: 'We really loved working with Appwrite for launching our bootstrapped "Open Mind" App. It was saving us a lot of money in comparison to Firebase since the amount of users grew quite fast and we needed a quick switch.'
                }
            ]
        }
    })
    .set('JSMastery', {
        template: 'review',
        title: 'Claim your JavaScript Mastery $50 credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan',
        data: {
            reviews: [
                {
                    name: 'Adrian Hajdin',
                    desc: 'Founder & CEO at JavaScript Mastery',
                    img: 'js_mastery_reviewer_2.webp',
                    review: 'Appwrite is the fastest-to-implement open-source BaaS with a growing community and a practical suite of products and APIs'
                }
            ]
        }
    })
    .set('FreeCodeCamp', {
        template: 'card',
        title: 'Claim your $50 FreeCodeCamp credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('AniaKubow', {
        template: 'card',
        title: 'Claim your $50 Ania Kubów credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('Fireship', {
        template: 'card',
        title: 'Claim your $50 Fireship credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('Hyperplexed', {
        template: 'card',
        title: 'Claim your $50 Hyperplexed credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('TraversyMedia', {
        template: 'card',
        title: 'Claim your $50 TraversyMedia credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('NetNinja', {
        template: 'card',
        title: 'Claim your $50 Net Ninja credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('CodeWithAntonio', {
        template: 'card',
        title: 'Claim your $50 Code With Antonio credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('Hacktoberfest2024', {
        template: 'card',
        title: 'Claim your $60 Hacktoberfest credits.',
        description:
            'Get $60 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('VueJS', {
        template: 'card',
        title: 'Claim your $50 VueJS credits.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan'
    })
    .set('FusionVC', {
        template: 'review',
        title: 'Welcome to Appwrite!',
        description:
            'Upgrade to Appwrite Pro and add the credits to enjoy the full capabilities of Cloud. Provided to you by Fusion VC.',
        footer: true,
        data: {
            reviews: [
                {
                    name: 'David Foster',
                    img: '1.jpeg',
                    desc: 'Managing director',
                    review: 'We really loved working with Appwrite for launching our bootstrapped "Open Mind" App. It was saving us a lot of money in comparison to Firebase since the amount of users grew quite fast and we needed a quick switch.'
                }
            ]
        }
    })
    .set('carbon', {
        template: 'review',
        title: 'Build your entire backend within minutes.',
        description:
            'Get $50 in Cloud credits when you upgrade or create an organization with a Pro plan.',
        data: {
            reviews: [
                {
                    name: 'David Foster',
                    img: '1.jpeg',
                    desc: 'Managing director',
                    review: 'We really loved working with Appwrite for launching our bootstrapped "Open Mind" App. It was saving us a lot of money in comparison to Firebase since the amount of users grew quite fast and we needed a quick switch.'
                }
            ]
        }
    });
