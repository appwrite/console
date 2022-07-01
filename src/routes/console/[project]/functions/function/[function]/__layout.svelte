<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { func } from './store';

    const functionId = $page.params.function;
    const path = `functions/function/${functionId}`;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        if ($func?.$id !== functionId) {
            await func.load(functionId);
            title.set($func.name);
        } else if ($func) {
            title.set($func.name);
        }

        backButton.set('');

        copyData.set({
            text: '',
            value: ''
        });

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
    }
</script>

{#if $func}
    <slot />
{/if}
