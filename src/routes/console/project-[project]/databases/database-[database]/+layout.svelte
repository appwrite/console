<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import type { Models } from '@aw-labs/appwrite-console';
    import CreateCollection from './createCollection.svelte';
    import { showCreate } from './store';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Dependencies } from '$lib/constants';

    const project = $page.params.project;
    const databaseId = $page.params.database;

    async function handleCreate(event: CustomEvent<Models.Collection>) {
        $showCreate = false;
        await invalidate(Dependencies.DATABASE);
        await goto(
            `${base}/console/project-${project}/databases/database-${databaseId}/collection-${event.detail.$id}`
        );
    }
</script>

<svelte:head>
    <title>Database - Appwrite</title>
</svelte:head>

<slot />

<CreateCollection bind:showCreate={$showCreate} on:created={handleCreate} />
