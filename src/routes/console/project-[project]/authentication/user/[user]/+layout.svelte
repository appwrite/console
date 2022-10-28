<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { page } from '$app/stores';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import Breadcrumbs from './breadcrumbs.svelte';
    import Header from './header.svelte';
    import { user } from './store';

    const userId = $page.params.user;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = user.load(userId);

        if ($user?.$id !== userId) {
            await promise;
        }

        updateLayout({
            header: Header,
            breadcrumb: Breadcrumbs
        });
    }
</script>

<svelte:head>
    <title>User - Appwrite</title>
</svelte:head>

{#if $user}
    <slot />
{/if}
