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
</svelte:head>

<Notifications />

<slot />
