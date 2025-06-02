<script lang="ts" context="module">
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';

    let showDelete = writable(false);

    export const promptDeleteProvider = (id: string) => {
        showDelete.set(true);
        goto(
            `${base}/project-${page.params.region}-${page.params.$id}/messaging/providers/provider-${id}`
        );
    };
</script>

<script lang="ts">
    import { CardGrid, BoxAvatar } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { provider } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import DeleteProvider from './deleteProvider.svelte';
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
