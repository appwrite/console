//campaign welcome and startup

export const campaigns = new Map();

campaigns
    .set('welcome', {
        title: "You've received $VALUE in credits",
        description:
            'Get $VALUE in credits when you upgrade or create an organization with a Pro plan.'
    })
    .set('startup', {
        title: "You've received $VALUE in credits",
        description:
            'Get $VALUE in credits when you upgrade or create an organization with a Pro plan.'
    });
