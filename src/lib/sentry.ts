import { env } from '$env/dynamic/public';
import * as Sentry from '@sentry/sveltekit';

export function setupSentry({ withSessionReplay }: { withSessionReplay: boolean }) {
    const dsn = env.PUBLIC_SENTRY_DSN;
    const environment = env.PUBLIC_SENTRY_ENVIRONMENT;

    if (!dsn) {
        return;
    }

    if (dsn && !environment) {
        throw new Error(
            "PUBLIC_SENTRY_ENVIRONMENT is required when PUBLIC_SENTRY_DSN is set. For local development, set it to your name, e.g. 'torsten'."
        );
    }

    const variables = {
        enabled: true,
        includePII: env.PUBLIC_SENTRY_INCLUDE_PII === 'true',
        tracesSampleRate: parseFloat(env.PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
        replaysSessionSampleRate: parseFloat(env.PUBLIC_SENTRY_REPLAY_SAMPLE_RATE),
        debug: env.PUBLIC_SENTRY_DEBUG === 'true'
    };

    const integrations = [];
    if (withSessionReplay) {
        integrations.push(
            Sentry.replayIntegration({
                maskAllText: variables.includePII ? false : true,
                maskAllInputs: variables.includePII ? false : true
            })
        );
    }

    Sentry.init({
        enabled: variables.enabled,
        dsn,
        tracesSampleRate: variables.tracesSampleRate,
        replaysSessionSampleRate: variables.replaysSessionSampleRate,
        replaysOnErrorSampleRate: 1,
        integrations,
        debug: variables.debug,
        sendDefaultPii: true
    });
}
