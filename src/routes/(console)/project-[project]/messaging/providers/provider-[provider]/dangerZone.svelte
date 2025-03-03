<script lang="ts" context="module">
    import { get } from 'svelte/store';

    let showDelete = writable(false);

    export const promptDeleteUser = (id: string) => {
        showDelete.set(true);
        goto(`${base}/project-${get(project).$id}/auth/user-${id}`);
    };
</script>

<script lang="ts">
    import { CardGrid, BoxAvatar } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { writable } from 'svelte/store';
    import { provider } from './store';
    import { goto } from '$app/navigation';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { project } from '$routes/(console)/project-[project]/store';
    import DeleteProvider from './deleteProvider.svelte';
    import { base } from '$app/paths';
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete provider</svelte:fragment>
    The provider's instance will be permanently deleted. This action is irreversible.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$provider.name}</h6>
            </svelte:fragment>
            <p>
                Last updated: {toLocaleDateTime($provider.$updatedAt)}
            </p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => ($showDelete = true)} event="delete_messaging_provider"
            >Delete</Button>
    </svelte:fragment>
</CardGrid>

<DeleteProvider bind:showDelete={$showDelete} />
