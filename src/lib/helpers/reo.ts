import { get } from 'svelte/store';
import { isCloud } from '$lib/system';
import { browser, dev } from '$app/environment';

import { user } from '$lib/stores/user';
import { reoInstance } from '$routes/(console)/store';
import { loadReoScript, type Reo, type ReoUserIdentifyConfig } from 'reodotdev';

/* Reo client ID */
const REO_CLIENT_ID = '144fa7eaa4904e8';

/* Initializes the Reo analytics script in production cloud environments. */
export function initReo() {
    if (dev || !browser || !isCloud) return;

    loadReoScript({ clientID: REO_CLIENT_ID }).then((reo: Reo) => {
        reoInstance.set(reo);
        reo.init({ clientID: REO_CLIENT_ID });
    });
}

/* Identifies the currently logged-in user with the Reo instance. */
export function identifyUserWithReo() {
    const userInstance = get(user);
    const localReoInstance = get(reoInstance);

    if (userInstance && Object.keys(userInstance).length && localReoInstance) {
        const name = userInstance.name || userInstance.email;
        const nameParts = name.trim().split(' ');
        const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

        const reoIdentity: ReoUserIdentifyConfig = {
            username: userInstance.email,
            firstname: nameParts[0],
            // there is no `password` returned from backend atm!
            type: 'email', // userInstance.password ? 'email' : 'github',
            ...(lastname && { lastname })
        };

        localReoInstance.identify(reoIdentity);
    }
}
