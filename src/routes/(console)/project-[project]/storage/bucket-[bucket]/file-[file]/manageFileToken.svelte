<script context="module" lang="ts">
    import { toLocaleDateTime } from '$lib/helpers/date';

    export function cleanFormattedDate(date: string): string {
        return toLocaleDateTime(date, true).replaceAll(', ', ' ');
    }
</script>

<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { Confirm, ExpirationInput, Modal } from '$lib/components';

    export let show = false;
    export let isDelete = false;
    export let fileToken: object | undefined = undefined;

    let expire = null;

    const dispatch = createEventDispatcher();

    function close() {
        show = false;
        expire = null;
        isDelete = false;
        fileToken = null;
    }

    function handleFileToken() {
        if (isDelete) {
            dispatch('deleted');
        } else {
            dispatch(fileToken ? 'updated' : 'created', expire);
        }
        close();
    }

    $: if (!show) {
        close();
    }
</script>

{#if isDelete}
    <Confirm bind:open={show} title="Delete token" onSubmit={handleFileToken}>
        {@const formattedDate = cleanFormattedDate(fileToken.created)}
        <p data-private>
            Are you sure you want to delete the file token created on <b>{formattedDate}</b>?
        </p>

        <p data-private>
            {#if fileToken.lastAccessed}
                {@const formattedDate = cleanFormattedDate(fileToken.lastAccessed)}

                This token was last accessed on <b>{formattedDate}</b>
            {:else}
                This token has never been accessed.
            {/if}
        </p>
    </Confirm>
{:else}
    <Modal
        bind:show
        onSubmit={handleFileToken}
        title={`${fileToken ? 'Edit' : 'Create'} file token`}>
        <!-- TODO: docs link needed-->
        <svelte:fragment slot="description">
            {#if fileToken}
                {@const formattedDate = cleanFormattedDate(fileToken.created)}
                Edit the expiry of the file token created on <b>{formattedDate}</b>
            {:else}
                Create a file token to grant public access to a file. Learn more.
            {/if}
        </svelte:fragment>

        <ExpirationInput
            bind:value={expire}
            resourceType="token"
            selectorLabel="Expiry"
            dateSelectorLabel="Expiry date" />

        <svelte:fragment slot="footer">
            <Button secondary on:click={close}>Cancel</Button>
            <Button submit>{fileToken ? 'Update' : 'Create'}</Button>
        </svelte:fragment>
    </Modal>
{/if}
