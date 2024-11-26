<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate, goto } from '$app/navigation';
    import { registerCommands } from '$lib/commandCenter';
    import { project } from '../../../store';
    import type { Models } from '@appwrite.io/console';
    import { base } from '$app/paths';
    import { canWriteSites } from '$lib/stores/roles';

    onMount(() => {
        let previousStatus = null;
        return sdk.forConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (previousStatus === message.payload.status) {
                return;
            }
            previousStatus = message.payload.status;
            if (message.events.includes('sites.*.deployments.*.create')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
            if (message.events.includes('sites.*.deployments.*.update')) {
                invalidate(Dependencies.DEPLOYMENTS);
                invalidate(Dependencies.FUNCTION);

                return;
            }
            if (message.events.includes('sites.*.deployments.*.delete')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
        });
    });

    $: $registerCommands([
        {
            label: 'Create deployment',
            async callback() {
                if (!$page.url.pathname.endsWith($page.params.site)) {
                    await goto(`${base}/project-${$project.$id}/sites/site-${$page.params.site}`);
                }
            },
            keys: $page.url.pathname.endsWith($page.params.site) ? ['c'] : ['c', 'd'],
            group: 'functions',
            icon: 'plus',
            disabled: !$canWriteSites
        },
        {
            label: 'Permissions',
            async callback() {
                await goto(
                    `${base}/project-${$project.$id}/sites/site-${$page.params.site}/settings#permissions`
                );
                scrollBy({ top: -100 });
            },
            icon: 'search',
            group: 'functions',
            disabled: !$canWriteSites
        },
        {
            label: 'Events',
            async callback() {
                await goto(
                    `${base}/project-${$project.$id}/sites/site-${$page.params.site}/settings#events`
                );
                scrollBy({ top: -100 });
            },
            icon: 'calendar',
            group: 'functions',
            disabled: !$canWriteSites
        },
        {
            label: 'Variables',
            async callback() {
                await goto(
                    `${base}/project-${$project.$id}/sites/site-${$page.params.site}/settings#variables`
                );
            },
            icon: 'list',
            group: 'functions',
            disabled: !$canWriteSites
        },
        {
            label: 'Timeout',
            callback() {
                goto(
                    `${base}/project-${$project.$id}/sites/site-${$page.params.site}/settings#timeout`
                );
            },
            icon: 'x-circle',
            group: 'functions',
            disabled: !$canWriteSites
        },
        {
            label: 'Schedule',
            async callback() {
                await goto(
                    `${base}/project-${$project.$id}/sites/site-${$page.params.site}/settings#schedule`
                );
                scrollBy({ top: -100 });
            },
            icon: 'clock',
            group: 'functions',
            disabled: !$canWriteSites
        },
        {
            label: 'Go to deployments',
            callback() {
                goto(`${base}/project-${$project.$id}/sites/site-${$page.params.site}`);
            },
            keys: ['g', 'd'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith($page.params.site)
        },
        {
            label: 'Go to usage',
            callback() {
                goto(`${base}/project-${$project.$id}/sites/site-${$page.params.site}/usage`);
            },
            keys: ['g', 'u'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('usage')
        },
        {
            label: 'Go to executions',
            callback() {
                goto(`${base}/project-${$project.$id}/sites/site-${$page.params.site}/executions`);
            },
            keys: ['g', 'e'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('executions')
        },
        {
            label: 'Go to settings',
            callback() {
                goto(`${base}/project-${$project.$id}/sites/site-${$page.params.site}/settings`);
            },
            keys: ['g', 's'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('settings') || !$canWriteSites
        }
    ]);
</script>

<slot />
