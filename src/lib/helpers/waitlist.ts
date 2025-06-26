import { sdk } from '$lib/stores/sdk';
import { type Account } from '$lib/stores/user';

export const joinWaitlistSites = (user: Account) => {
    const prefs = user.prefs;
    const newPrefs = {
        ...prefs,
        joinWaitlistSites: true
    };

    sdk.forConsole.account.updatePrefs(newPrefs);

    if (sessionStorage) {
        sessionStorage.setItem('joinWaitlistSites', 'true');
    }
};

export const isOnWaitlistSites = (user: Account): boolean => {
    const prefs = user.prefs;
    const joinedInPrefs = 'joinWaitlistSites' in prefs;

    let joinedInSession = false;
    if (sessionStorage) {
        joinedInSession = sessionStorage.getItem('joinWaitlistSites') === 'true';
    }

    return joinedInSession || joinedInPrefs;
};
