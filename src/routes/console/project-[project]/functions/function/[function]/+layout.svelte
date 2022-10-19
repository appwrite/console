<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { func } from './store';

    const functionId = $page.params.function;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = func.load(functionId);
        if ($func?.$id !== functionId) {
            await promise;
        }

        // updateLayout({
        //     navigate: event,
        //     title: $func.name,
        //     level: 4,
        //     breadcrumbs: {
        //         title: $func.name,
        //         href: `function/${functionId}`
        //     },
        //     tabs: [
        //         {
        //             href: path,
        //             title: 'Overview'
        //         },
        //         {
        //             href: `${path}/monitors`,
        //             title: 'Monitors'
        //         },
        //         {
        //             href: `${path}/logs`,
        //             title: 'Logs'
        //         },
        //         {
        //             href: `${path}/settings`,
        //             title: 'Settings'
        //         }
        //     ]
        // });
    }
</script>

{#if $func}
    <slot />
{/if}
