<script context="module" lang="ts">
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';

    export function cleanFormattedDate(date: string, time: boolean = false): string {
        return time
            ? toLocaleDateTime(date, true)
            : toLocaleDate(date, 'dd mm yyyy').replaceAll(', ', ' ');
    }
</script>

<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { Link } from '@appwrite.io/pink-svelte';
    import { type Models } from '@appwrite.io/console';
    import { Permissions } from '$lib/components/permissions';
    import { Confirm, ExpirationInput, Modal } from '$lib/components';

    export let show = false;
    export let isDelete = false;
    export let isUpdatePermissions = false;
    export let fileToken: Models.ResourceToken | null = null;

    $: expire = fileToken?.expire ?? null;

    const dispatch = createEventDispatcher();

    function close() {
        show = false;
        expire = null;
        isDelete = false;
        fileToken = null;
        isUpdatePermissions = false;
    }

    function handleFileToken() {
        if (isDelete) {
            dispatch('deleted');
        } else {
            dispatch(
                fileToken ? 'updated' : 'created',
                fileToken ? { ...fileToken, expire } : expire
            );
        }
        close();
    }

    $: if (!show) {
        close();
    }
</script>

{#if isDelete}
    <Confirm bind:open={show} title="Delete token" onSubmit={handleFileToken}>
        {@const formattedDate = cleanFormattedDate(fileToken.$createdAt)}
        <p data-private>
            Are you sure you want to delete the file token created on <b>{formattedDate}</b>?
        </p>

        <p data-private>
            {#if fileToken.accessedAt}
                {@const formattedDate = cleanFormattedDate(fileToken.accessedAt, true)}

                This token was last accessed on <b>{formattedDate}</b>
            {:else}
                This token has never been accessed.
            {/if}
        </p>
    </Confirm>
{:else}
    <Modal
        bind:show
        size="s"
        onSubmit={handleFileToken}
        title={`${fileToken ? 'Edit' : 'Create'} file token`}>
        <!-- TODO: docs link needed-->
        <svelte:fragment slot="description">
            {#if fileToken}
                {#if isUpdatePermissions}
                    Choose who can access or update your file using this token.
                    <Link.Anchor
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://appwrite.io/docs/advanced/platform/permissions">
                        Learn more
                    </Link.Anchor>.
                {:else}
                    {@const formattedDate = cleanFormattedDate(fileToken.$createdAt)}
                    Edit the expiry of the file token created on <b>{formattedDate}</b>.
                {/if}
            {:else}
                Create a file token to grant access to a file.
                <Link.Anchor href="https://appwrite.com/docs/">Learn more</Link.Anchor>.
            {/if}
        </svelte:fragment>

        {#if isUpdatePermissions}
            <Permissions bind:permissions={fileToken.$permissions} hideOnClick />
        {:else}
            <ExpirationInput
                bind:value={expire}
                resourceType="token"
                selectorLabel="Expiry"
                dateSelectorLabel="Expiry date" />
        {/if}

        <svelte:fragment slot="footer">
            <Button secondary on:click={close}>Cancel</Button>
            <Button submit>{fileToken ? 'Update' : 'Create'}</Button>
        </svelte:fragment>
    </Modal>
{/if}
