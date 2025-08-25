<script lang="ts" context="module">
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { getProjectRoute } from '$lib/helpers/project';

    let showDelete = writable(false);

    export const promptDeleteProvider = (id: string) => {
        showDelete.set(true);
        goto(getProjectRoute(`/messaging/providers/provider-${id}`));
    };
</script>

<script lang="ts">
    import { provider } from './store';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import DeleteProvider from './deleteProvider.svelte';
    import { CardGrid, BoxAvatar } from '$lib/components';
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
