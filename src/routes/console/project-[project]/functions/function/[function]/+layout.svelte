<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { func, execute } from './store';
    import Execute from './execute.svelte';
    import { updateLayout } from '$lib/stores/layout';
    import Header from './header.svelte';
    import Breadcrumbs from './breadcrumbs.svelte';

    const functionId = $page.params.function;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = func.load(functionId);
        if ($func?.$id !== functionId) {
            await promise;
        }

        updateLayout({
            breadcrumb: Breadcrumbs,
            header: Header
        });
    }
</script>

{#if $func}
    <slot />
{/if}

{#if $execute}
    <Execute selectedFunction={$execute} />
{/if}
