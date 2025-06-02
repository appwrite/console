<script lang="ts">
    import { BoxAvatar, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import DeleteModal from './deleteModal.svelte';

    export let message: Models.Message & { data: Record<string, unknown> };

    let showDelete = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete message</svelte:fragment>
    The message will be permanently deleted{message.status === 'scheduled'
        ? ', and its delivery will be canceled'
        : ''}. This action is irreversible.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1" data-private>
                    {message.data.title ??
                        message.data.subject ??
                        message.data.content ??
                        'Message'}
                </h6>
            </svelte:fragment>
            <p>
                Last updated: {toLocaleDateTime(message.$updatedAt)}
            </p>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)} event="delete_message"
            >Delete</Button>
    </svelte:fragment>
</CardGrid>

<DeleteModal {message} bind:show={showDelete} />
