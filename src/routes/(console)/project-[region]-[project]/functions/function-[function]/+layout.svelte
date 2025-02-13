<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { realtime } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate, goto } from '$app/navigation';
    import { registerCommands } from '$lib/commandCenter';
    import { func, showCreateDeployment } from './store';
    import { project } from '../../store';
    import type { Models } from '@appwrite.io/console';
    import { base } from '$app/paths';
    import { canWriteFunctions } from '$lib/stores/roles';

    onMount(() => {
        let previousStatus = null;
        return realtime
            .forProject($page.params.region, $page.params.project)
            .subscribe<Models.Deployment>('console', (message) => {
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
                    await goto(
                        `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}`
                    );
                }
                showCreateDeployment.set(true);
            },
            keys: $page.url.pathname.endsWith($func.$id) ? ['c'] : ['c', 'd'],
            group: 'functions',
            icon: 'plus',
            disabled: !$canWriteFunctions
        },
        {
            label: 'Permissions',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/settings#permissions`
                );
                scrollBy({ top: -100 });
            },
            icon: 'search',
            group: 'functions',
            disabled: !$canWriteFunctions
        },
        {
            label: 'Events',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/settings#events`
                );
                scrollBy({ top: -100 });
            },
            icon: 'calendar',
            group: 'functions',
            disabled: !$canWriteFunctions
        },
        {
            label: 'Variables',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/settings#variables`
                );
            },
            icon: 'list',
            group: 'functions',
            disabled: !$canWriteFunctions
        },
        {
            label: 'Timeout',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/settings#timeout`
                );
            },
            icon: 'x-circle',
            group: 'functions',
            disabled: !$canWriteFunctions
        },
        {
            label: 'Schedule',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/settings#schedule`
                );
                scrollBy({ top: -100 });
            },
            icon: 'clock',
            group: 'functions',
            disabled: !$canWriteFunctions
        },
        {
            label: 'Go to deployments',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}`
                );
            },
            keys: ['g', 'd'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith($func.$id)
        },
        {
            label: 'Go to usage',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/usage`
                );
            },
            keys: ['g', 'u'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('usage')
        },
        {
            label: 'Go to executions',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/executions`
                );
            },
            keys: ['g', 'e'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('executions')
        },
        {
            label: 'Go to settings',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/settings`
                );
            },
            keys: ['g', 's'],
            group: 'navigation',
            rank: 10,
            disabled: $page.url.pathname.endsWith('settings') || !$canWriteFunctions
        }
    ]);
</script>

<slot />
