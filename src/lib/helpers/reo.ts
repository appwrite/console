import { get } from 'svelte/store';
import { isCloud } from '$lib/system';
import { browser, dev } from '$app/environment';
import { type Models } from '@appwrite.io/console';
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
export function identifyUserWithReo(user: Models.User<Models.Preferences>) {
    const localReoInstance = get(reoInstance);
    if (Object.keys(user).length && localReoInstance) {
        const name = user.name || user.email;
        const nameParts = name.trim().split(' ');
        const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

        const reoIdentity: ReoUserIdentifyConfig = {
            username: user.email,
            firstname: nameParts[0],
            type: user.password ? 'email' : 'github',
            ...(lastname && { lastname })
        };

        localReoInstance.identify(reoIdentity);
    }
}
