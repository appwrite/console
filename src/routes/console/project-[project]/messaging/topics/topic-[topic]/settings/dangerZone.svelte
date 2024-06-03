<script lang="ts">
    import { CardGrid, BoxAvatar, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { topic, topicTotal } from '../store';
    import DeleteTopic from '../deleteTopic.svelte';

    let showDelete = false;
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
                {$topicTotal} subscriber{$topicTotal === 1 ? '' : 's'}
            </p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)} event="delete_messaging_topic"
            >Delete</Button>
    </svelte:fragment>
</CardGrid>

<DeleteTopic bind:showDelete />
