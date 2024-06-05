//campaign welcome and startup

export const campaigns = new Map();

campaigns
    .set('welcome', {
        title: "You've received $VALUE in credits",
        description:
            'Get $VALUE in credits when you upgrade or create an organization with a Pro plan.'
    })
    .set('startup', {
        title: 'Welcome to the Startups program!',
        description:
            "We're excited to have you on board. Add your credit code to your Appwrite Pro account to join."
    })
    .set('RenderATL2024', {
        title: 'Claim your RenderATL $100 credits',
        description:
            'Get $100 in Cloud credits when you upgrade or create an organization with a Pro plan.'
    });
