<script lang="ts" context="module">
    import { get } from 'svelte/store';
    let showDelete = writable(false);
    export const promptDeleteUser = (id: string) => {
        showDelete.set(true);
        goto(`/console/project-${get(project).$id}/auth/user-${id}`);
    };
</script>

<script lang="ts">
    import { CardGrid, BoxAvatar, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { writable } from 'svelte/store';
    import { topic } from './store';
    import { goto } from '$app/navigation';
    import { project } from '$routes/console/project-[project]/store';
    import DeleteTopic from './deleteTopic.svelte';
</script>

<CardGrid danger>
    <div>
        <Heading tag="h6" size="7">Delete topic</Heading>
    </div>
    <p>
        The topic will be permanently deleted, including all data associated with this topic. This
        action is irreversible.
    </p>
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$topic.name}</h6>
            </svelte:fragment>
            <p>
                {$topic.total} subscriber{$topic.total === 1 ? '' : 's'}
            </p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => ($showDelete = true)} event="delete_messaging_provider"
            >Delete</Button>
    </svelte:fragment>
</CardGrid>

<DeleteTopic bind:showDelete={$showDelete} />
