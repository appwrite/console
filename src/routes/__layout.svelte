<script context="module">
    import '@aw-labs/ui/src/_index.scss';
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { user } from '$lib/stores/user';
    import { onMount } from 'svelte';
    import Notifications from '$lib/layout/notifications.svelte';
    import { base } from '$app/paths';
    import { browser } from '$app/env';
    import { app } from '$lib/stores/app';

    if (browser) {
        window.GOOGLE_ANALYTICS = import.meta.env.VITE_GOOGLE_ANALYTICS?.toString() ?? false;
    }

    onMount(async () => {
        try {
            if (!$user) {
                await user.fetchUser();
            }

            if (!$page.url.pathname.startsWith('/console')) {
                await goto(`${base}/console`);
            }
        } catch (error) {
            await goto(`${base}/login`);
        }
    });

    $: {
        if (browser) {
            if ($app.theme === 'auto') {
                const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
                if (darkThemeMq.matches) {
                    document.body.setAttribute('class', `theme-dark`);
                } else {
                    document.body.setAttribute('class', `theme-light`);
                }
            } else {
                document.body.setAttribute('class', `theme-${$app.theme}`);
            }
        }
    }
</script>

<svelte:head>
    {#if browser && window.GOOGLE_ANALYTICS}
        <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${window.GOOGLE_ANALYTICS}`}></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', window.GOOGLE_ANALYTICS);
        </script>
    {/if}
    <!-- Doorbell Code -->

    <script type="text/javascript">
        window.doorbellOptions = {
            id: '13243',
            appKey: 'IfjGo7zzMcyIBZXvLXoj305scu2ovRnAXEBVWsdPDUG7JSgnlvuFBY5y6U0UgFGl'
        };
        (function (w, d, t) {
            var hasLoaded = false;
            function l() {
                if (hasLoaded) {
                    return;
                }
                hasLoaded = true;
                window.doorbellOptions.windowLoaded = true;
                var g = d.createElement(t);
                g.id = 'doorbellScript';
                g.type = 'text/javascript';
                g.async = true;
                g.src =
                    'https://embed.doorbell.io/button/' +
                    window.doorbellOptions['id'] +
                    '?t=' +
                    new Date().getTime();
                (
                    d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]
                ).appendChild(g);
            }
            if (w.attachEvent) {
                w.attachEvent('onload', l);
            } else if (w.addEventListener) {
                w.addEventListener('load', l, false);
            } else {
                l();
            }
            if (d.readyState == 'complete') {
                l();
            }
        })(window, document, 'script');
    </script>
</svelte:head>

<Notifications />

<slot />
