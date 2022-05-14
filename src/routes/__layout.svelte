<script context="module">
    import '@dittmann/ui/src/_index.scss';
</script>

<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';
    import { onMount } from 'svelte';
    import Notifications from '$lib/layout/notifications.svelte';
    import { base } from '$app/paths';
    import { browser } from '$app/env';
    import { app } from '$lib/stores/app';

    onMount(async () => {
        try {
            if (!$user) {
                user.set(await sdkForConsole.account.get());
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
            document.body.setAttribute('class', `theme-${$app.theme}`);
        }
    }
</script>

<Notifications />

<slot />
