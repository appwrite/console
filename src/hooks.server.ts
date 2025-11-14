import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import { setupSentry } from '$lib/sentry';

setupSentry({
    withSessionReplay: false
});

export const handle = sequence(sentryHandle());

export const handleError = handleErrorWithSentry();
