<script lang="ts">
    import { execute, func } from './store';
    import Execute from './execute.svelte';
    import { registerCommands } from '$lib/commandCenter';
    import { goto } from '$app/navigation';
    import { project } from '../../store';
    import { page } from '$app/stores';
    import { showCreateDeployment } from './+page.svelte';

    $: $registerCommands([
        {
            label: 'Create deployment',
            async callback() {
                if (!$page.url.pathname.endsWith($func.$id)) {
                    await goto(`/console/project-${$project.$id}/functions/function-${$func.$id}`);
                }
                showCreateDeployment();
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
