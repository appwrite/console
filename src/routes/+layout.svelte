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
    import { BrowserTracing } from '@sentry/tracing';
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
                integrations: [new BrowserTracing()],
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
            const isCloudClass = isCloud ? 'is-cloud' : '';
            if ($app.theme === 'auto') {
                const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
                if (darkThemeMq.matches) {
                    document.body.setAttribute('class', `theme-dark ${isCloudClass}`);
                    $app.themeInUse = 'dark';
                } else {
                    document.body.setAttribute('class', `theme-light ${isCloudClass}`);
                    $app.themeInUse = 'light';
                }
            } else {
                document.body.setAttribute('class', `theme-${$app.theme} ${isCloudClass}`);
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
        mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: destination-out;
        mask-composite: exclude;
        pointer-events: none;
    }

    :root {
        /** Neutral **/

        --color-neutral-0-new: 0 0% 100%; /* #ffffff */
        --color-neutral-5-new: 240 11% 98%; /* #FAFAFB */
        --color-neutral-10-new: 240 9% 94%; /* #EDEDF0 */
        --color-neutral-15-new: 240 4% 85%; /* #D8D8DB */
        --color-neutral-20-new: 240 3% 77%; /* #C3C3C6 */

        --color-neutral-50-new: 240 2% 52%; /* #818186 */
        --color-neutral-60-new: 240 2% 43%; /* #6C6C71 */
        --color-neutral-70-new: 240 3% 35%; /* #56565C */

        --color-neutral-80-new: 240 4% 27%; /* #414146 */
        --color-neutral-85-new: 240 4% 18%; /* #2D2D31 */
        --color-neutral-90-new: 240 7% 12%; /* #1D1D21 */
        --color-neutral-100-new: 240 6% 10%; /* #19191C */
        --color-neutral-110-new: 240 5% 8%; /* #141416 */

        --color-neutral-0: var(--color-neutral-0-new);
        --color-neutral-5: var(--color-neutral-5-new);
        --color-neutral-10: var(--color-neutral-10-new);
        --color-neutral-30: var(--color-neutral-15-new);
        --color-neutral-50: var(--color-neutral-20-new);

        --color-neutral-70: var(--color-neutral-50-new);
        --color-neutral-100: var(--color-neutral-60-new);
        --color-neutral-120: var(--color-neutral-70-new);

        --color-neutral-150: var(--color-neutral-80-new);
        --color-neutral-200: var(--color-neutral-85-new);
        --color-neutral-300: var(--color-neutral-90-new);
        --color-neutral-400: var(--color-neutral-100-new);
        --color-neutral-500: var(--color-neutral-110-new);

        // --color-neutral-0:   0    0% 100%;   /* #ffffff */
        // --color-neutral-5:   240 11%  98%;   /* #FAFAFB */
        // --color-neutral-10:  240  9%  94%;   /* #EDEDF0 */
        // --color-neutral-15:  240  4%  85%;   /* #D8D8DB */
        // --color-neutral-20:  240  3%  77%;   /* #C3C3C6 */

        // --color-neutral-50:  240  2%  52%;   /* #818186 */
        // --color-neutral-60:  240  2%  43%;   /* #6C6C71 */
        // --color-neutral-70:  240  3%  35%;   /* #56565C */

        // --color-neutral-80:  240  4%  27%;   /* #414146 */
        // --color-neutral-85:  240  4%  18%;   /* #2D2D31 */
        // --color-neutral-90:  240  7%  12%;   /* #1D1D21 */
        // --color-neutral-100: 240  6%  10%;   /* #19191C */

    }

    .card {
        --p-card-bg-color: var(--color-neutral-5-new);
    }

    :global(.theme-dark) .card {
        --p-card-bg-color: var(--color-neutral-100-new);
    }

    .is-cloud {
        --heading-font: 'Aeonik Pro', arial, sans-serif;
    }
</style>
