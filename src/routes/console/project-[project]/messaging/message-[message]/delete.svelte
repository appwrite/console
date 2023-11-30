<script lang="ts">
    import { BoxAvatar, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import DeleteModal from './deleteModal.svelte';
    import { message } from './store';

    let showDelete = false;
</script>

<CardGrid>
    <Heading tag="h6" size="7">Delete message</Heading>
    <p>
        The message will be permanently deleted, including all data associated with this message.
        This action is irreversible.
    </p>
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1" data-private>
                    {$message.data.title ??
                        $message.data.subject ??
                        $message.data.content ??
                        'Message'}
                </h6>
            </svelte:fragment>
            <p>
                Last updated: {toLocaleDateTime($message.$updatedAt)}
            </p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)} event="delete_file">Delete</Button>
    </svelte:fragment>
</CardGrid>

<DeleteModal bind:show={showDelete} />
