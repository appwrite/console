<script lang="ts">
    import { browser } from '$app/environment';
    import { afterNavigate, goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackPageView } from '$lib/actions/analytics';
    import { Notifications, Progress } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { isCloud } from '$lib/system';
    import { onMount } from 'svelte';
    import { requestedMigration } from './store';
    import { parseIfString } from '$lib/helpers/object';
    import { sdk } from '$lib/stores/sdk';
    import { campaigns } from '$lib/stores/campaigns';
    import { user } from '$lib/stores/user';
    import { loading } from '$routes/store';

    onMount(async () => {
        // handle sources
        if (isCloud) {
            const urlParams = $page.url.searchParams;
            const ref = urlParams.get('ref');
            const utmSource = urlParams.get('utm_source');
            const utmMedium = urlParams.get('utm_medium');
            const utmCampaign = urlParams.get('utm_campaign');
            let referrer = document.referrer.length ? document.referrer : null;

            // Skip our own
            if (referrer?.includes('//appwrite.io')) {
                referrer = null;
            }

            if (ref || referrer || utmSource || utmCampaign || utmMedium) {
                sdk.forConsole.sources.create(ref, referrer, utmSource, utmCampaign, utmMedium);
            }
        }

        if ($page.url.searchParams.has('migrate')) {
            const migrateData = $page.url.searchParams.get('migrate');
            requestedMigration.set(parseIfString(migrateData) as Record<string, string>);
        }

        if ($page.url.searchParams.has('code')) {
            const code = $page.url.searchParams.get('code');
            const coupon = await sdk.forConsole.billing.getCoupon(code).catch<null>(() => null);
            if (coupon?.campaign && campaigns.has(coupon.campaign)) {
                if ($user) {
                    goto(`${base}/apply-credit?code=${code}`);
                    loading.set(false);
                    return;
                }
            }
        }
        if (user && $page.url.searchParams.has('campaign')) {
            const campaign = $page.url.searchParams.get('campaign');
            if (campaigns.has(campaign)) {
                goto(`${base}/apply-credit?campaign=${campaign}`);
                loading.set(false);
                return;
            }
        }

        loading.set(false);
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
<!-- {#if isCloud}
    <Consent />
{/if} -->

<slot />

<Progress />

<!-- svelte-ignore css-unused-selector -->
<style lang="scss" global>
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';
    .tippy-box {
        --p-tooltip-text-color: var(--color-neutral-10);
        --p-tooltip--bg-color: var(--color-neutral-80);

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
        --separator-color: hsl(var(--color-neutral-85));
        --separator-text: hsl(var(--color-neutral-60));
    }

    .with-separators {
        --separator-color: hsl(var(--color-neutral-10));
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

    .is-cloud {
        --heading-font: 'Aeonik Pro', arial, sans-serif;
        .heading-level {
            @media #{$break3open} {
                &-1,
                &-2,
                &-3,
                &-4,
                &-5,
                &-6,
                &-7 {
                    font-weight: 500;
                }
            }
        }
    }

    /* TODO: remove this block once Pink V2 is incorporated */
    .theme-dark input:is([type='checkbox'], [type='radio'], [type='switchbox']):not(:checked) {
        background-color: transparent; /* take whatever color is behind */
        border: 1px solid var(--color-mid-neutral-70, #56565c);
    }
</style>
