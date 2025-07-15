import { page } from '$app/state';
import { browser } from '$app/environment';

let referrer = $state<string | null>(null);

if (browser) {
    let previousURL = $state(page.url.href);

    const currentURL = page.url.href;
    if (currentURL !== previousURL) {
        referrer = previousURL;
        previousURL = currentURL;
    }
}

export const getReferrer = () => {
    return referrer;
};
