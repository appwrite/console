<script lang="ts">
    import { browser } from '$app/environment';
    import { afterNavigate, goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { isTrackingAllowed, trackPageView } from '$lib/actions/analytics';
    import { reportWebVitals } from '$lib/helpers/vitals';
    import { Notifications, Progress } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { user } from '$lib/stores/user';
    import { ENV, isCloud } from '$lib/system';
    import * as Sentry from '@sentry/svelte';
    import LogRocket from 'logrocket';
    import { onMount } from 'svelte';
    import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';
    import Loading from './loading.svelte';
    import { loading, requestedMigration } from './store';
    import { parseIfString } from '$lib/helpers/object';

    if (browser) {
        window.VERCEL_ANALYTICS_ID = import.meta.env.VERCEL_ANALYTICS_ID?.toString() ?? false;
    }

    onMount(async () => {
        if ($page.url.searchParams.has('migrate')) {
            const migrateData = $page.url.searchParams.get('migrate');
            requestedMigration.set(parseIfString(migrateData) as Record<string, string>);
        }
        /**
         * Reporting Web Vitals.
         */
        if (ENV.PROD && window.VERCEL_ANALYTICS_ID) {
            onCLS(reportWebVitals);
            onFID(reportWebVitals);
            onLCP(reportWebVitals);
            onFCP(reportWebVitals);
            onINP(reportWebVitals);
            onTTFB(reportWebVitals);
        }

        if (ENV.PROD) {
            /**
             * Sentry Error Logging
             */
            Sentry.init({
                dsn: 'https://c7ce178bdedd486480317b72f282fd39@o1063647.ingest.sentry.io/4504158071422976',
                integrations: [new Sentry.BrowserTracing()],
                tracesSampleRate: 1.0
            });

            /**
             * LogRocket
             */
            if (isCloud && isTrackingAllowed()) {
                LogRocket.init('rgthvf/appwrite', {
                    dom: {
                        inputSanitizer: true
                    }
                });
            }
        }

        /**
         * Handle initial load.
         */
        if (!$page.url.pathname.startsWith('/auth') && !$page.url.pathname.startsWith('/git')) {
            const acceptedRoutes = [
                '/login',
                '/register',
                '/recover',
                '/invite',
                '/card',
                '/hackathon'
            ];
            if ($user) {
                if (
                    !$page.url.pathname.startsWith('/console') &&
                    !$page.url.pathname.startsWith('/invite') &&
                    !$page.url.pathname.startsWith('/card') &&
                    !$page.url.pathname.startsWith('/hackathon')
                ) {
                    await goto(`${base}/console`, {
                        replaceState: true
                    });
                }
                loading.set(false);
            } else {
                if (acceptedRoutes.some((n) => $page.url.pathname.startsWith(n))) {
                    await goto(`${base}${$page.url.pathname}${$page.url.search}`);
                } else {
                    await goto(`${base}/login`, {
                        replaceState: true
                    });
                }
                loading.set(false);
            }
        }
    });

    afterNavigate((navigation) => {
        if (navigation.type !== 'enter' && navigation.from?.route?.id !== navigation.to.route.id) {
            trackPageView(navigation.to.route.id);
        }
    });

    $: {
        if (browser) {
            if ($app.theme === 'auto') {
                const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
                if (darkThemeMq.matches) {
                    document.body.setAttribute('class', `theme-dark`);
                    $app.themeInUse = 'dark';
                } else {
                    document.body.setAttribute('class', `theme-light`);
                    $app.themeInUse = 'light';
                }
            } else {
                document.body.setAttribute('class', `theme-${$app.theme}`);
                $app.themeInUse = $app.theme;
            }
        }
    }
</script>

<Notifications />

<slot />

{#if $loading}
    <Loading />
{/if}

<Progress />

<!-- svelte-ignore css-unused-selector -->
<style lang="scss" global>
    .tippy-box {
        --p-tooltip-text-color: var(--color-neutral-10);
        --p-tooltip--bg-color: var(--color-neutral-100);

        background-color: hsl(var(--p-tooltip--bg-color));
        color: hsl(var(--p-tooltip-text-color));
        font-size: var(--font-size-0);
        line-height: 1.5;

        &[data-placement^='top'] > .tippy-arrow::before {
            border-top-color: hsl(var(--p-tooltip--bg-color));
        }
        &[data-placement^='bottom'] > .tippy-arrow::before {
            border-bottom-color: hsl(var(--p-tooltip--bg-color));
        }
        &[data-placement^='left'] > .tippy-arrow::before {
            border-left-color: hsl(var(--p-tooltip--bg-color));
        }
        &[data-placement^='right'] > .tippy-arrow::before {
            border-right-color: hsl(var(--p-tooltip--bg-color));
        }
    }

    .theme-dark .with-separators {
        --separator-color: hsl(var(--color-neutral-200));
        --separator-text: hsl(var(--color-neutral-100));
    }

    .with-separators {
        --separator-color: hsl(var(--color-neutral-5));
        --separator-text: hsl(var(--color-neutral-50));
    }

    .with-separators {
        display: flex;
        align-items: center;
        gap: 1rem;

        text-transform: uppercase;
        width: 100%;

        color: var(--separator-text);

        &::before,
        &::after {
            content: '';
            flex: 1;
            height: 1px;
            background: var(--separator-color);
        }
    }

    .border-gradient {
        position: relative;
    }

    .border-gradient::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: var(--border-radius);
        border: var(--border-size) solid transparent;
        background: var(--border-gradient) border-box;
        mask:
            linear-gradient(#fff 0 0) padding-box,
            linear-gradient(#fff 0 0);
        -webkit-mask:
            linear-gradient(#fff 0 0) padding-box,
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out;
        mask-composite: exclude;
        pointer-events: none;
    }
</style>
