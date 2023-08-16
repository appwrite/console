<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate, goto } from '$app/navigation';
    import { registerCommands } from '$lib/commandCenter';
    import { execute, func, showCreateDeployment } from './store';
    import { project } from '../../store';
    import type { Models } from '@appwrite.io/console';
    import Execute from './execute.svelte';

    onMount(() => {
        let previousStatus = null;
        return sdk.forConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (previousStatus === message.payload.status) {
                return;
            }
            previousStatus = message.payload.status;
            if (message.events.includes('functions.*.deployments.*.create')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
            if (message.events.includes('functions.*.deployments.*.update')) {
                invalidate(Dependencies.DEPLOYMENTS);
                invalidate(Dependencies.FUNCTION);

                return;
            }
            if (message.events.includes('functions.*.deployments.*.delete')) {
                invalidate(Dependencies.DEPLOYMENTS);

                return;
            }
        });
    });

    $: $registerCommands([
        {
            label: 'Create deployment',
            async callback() {
                if (!$page.url.pathname.endsWith($func.$id)) {
                    await goto(`/console/project-${$project.$id}/functions/function-${$func.$id}`);
                }
                showCreateDeployment.set(true);
            },
            keys: $page.url.pathname.endsWith($func.$id) ? ['c'] : ['c', 'd'],
            group: 'functions',
            icon: 'plus'
        },
        {
            label: 'Permissions',
            async callback() {
                await goto(
                    `/console/project-${$project.$id}/functions/function-${$func.$id}/settings#permissions`
                );
                scrollBy({ top: -100 });
            },
            icon: 'search',
            group: 'functions'
        },
        {
            label: 'Events',
            async callback() {
                await goto(
                    `/console/project-${$project.$id}/functions/function-${$func.$id}/settings#events`
                );
                scrollBy({ top: -100 });
            },
            icon: 'calendar',
            group: 'functions'
        },
        {
            label: 'Variables',
            async callback() {
                await goto(
                    `/console/project-${$project.$id}/functions/function-${$func.$id}/settings#variables`
                );
            },
            icon: 'list',
            group: 'functions'
        },
        {
            label: 'Timeout',
            callback() {
                goto(
                    `/console/project-${$project.$id}/functions/function-${$func.$id}/settings#timeout`
                );
            },
            icon: 'x-circle',
            group: 'functions'
        },
        {
            label: 'Schedule',
            async callback() {
                await goto(
                    `/console/project-${$project.$id}/functions/function-${$func.$id}/settings#schedule`
                );
                scrollBy({ top: -100 });
            },
            icon: 'clock',
            group: 'functions'
        },
        {
            label: 'Go to deployments',
            callback() {
                goto(`/console/project-${$project.$id}/functions/function-${$func.$id}`);
            },
            keys: ['g', 'd'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith($func.$id)
        },
        {
            label: 'Go to usage',
            callback() {
                goto(`/console/project-${$project.$id}/functions/function-${$func.$id}/usage`);
            },
            keys: ['g', 'u'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('usage')
        },
        {
            label: 'Go to executions',
            callback() {
                goto(`/console/project-${$project.$id}/functions/function-${$func.$id}/executions`);
            },
            keys: ['g', 'e'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('executions')
        },
        {
            label: 'Go to settings',
            callback() {
                goto(`/console/project-${$project.$id}/functions/function-${$func.$id}/settings`);
            },
            keys: ['g', 's'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('settings')
        }
    ]);
</script>

<slot />

<Execute selectedFunction={$execute} />
