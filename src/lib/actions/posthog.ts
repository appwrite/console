import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { VARS, ENV } from '$lib/system';
import type { Models } from '@appwrite.io/console';
import { preferences } from '$lib/stores/preferences';

const POSTHOG_PREFS_KEY = 'posthog_session_recorded';

if (browser && VARS.POSTHOG_API_KEY && !ENV.DEV && !ENV.TEST) {
    posthog.init(VARS.POSTHOG_API_KEY, {
        api_host: VARS.POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        session_recording: {
            recordCrossOriginIframes: false,
            /*maskTextSelector: '.ph-no-capture'*/
        },
        autocapture: true,
        disable_session_recording: !ENV.PROD
    });
}

export async function initializeSessionRecording(user: Models.User<Models.Preferences>): Promise<void> {
    if (!posthog) return;

    const hasRecordedFirstSession = preferences.getKey(POSTHOG_PREFS_KEY, false);

    if (!hasRecordedFirstSession) {
        posthog.identify(user.$id, {
            account_created: user.$createdAt
        });
        posthog.startSessionRecording();
        await preferences.setKey(POSTHOG_PREFS_KEY, true);
    } else {
        posthog.stopSessionRecording();
    }
}

export { posthog };
