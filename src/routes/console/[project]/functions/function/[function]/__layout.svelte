<script lang="ts">
    import { browser } from '$app/env';
    import { page } from '$app/stores';
    import { tabs, title } from '$lib/stores/layout';
    import { func } from './store';

    const functionId = $page.params.function;
    const path = `functions/function/${functionId}`;

    $: {
        if (browser) {
            func.load(functionId);
        }
    }

    $: {
        if ($func) {
            title.set($func.name);
        }
    }

    tabs.set([
        {
            href: path,
            title: 'Overview'
        },
        {
            href: `${path}/monitors`,
            title: 'Monitors'
        },
        {
            href: `${path}/logs`,
            title: 'Logs'
        },
        {
            href: `${path}/settings`,
            title: 'Settings'
        }
    ]);
</script>

{#if $func}
    <slot />
{/if}
