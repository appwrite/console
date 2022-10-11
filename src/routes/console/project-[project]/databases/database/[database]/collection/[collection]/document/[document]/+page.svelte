<script lang="ts">
    import { CardGrid, Box } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { doc } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Document from './_document.svelte';
    import Delete from './_delete.svelte';
    import { difference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';

    let showDelete = false;
    let permissions = $doc?.$permissions;
    let arePermsDisabled = true;

    async function updatePermissions() {
        try {
            await sdkForProject.databases.updateDocument(
                $doc.$databaseId,
                $doc.$collectionId,
                $doc.$id,
                $doc.data,
                permissions
            );
            $doc.$permissions = permissions;
            arePermsDisabled = true;
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    $: if (permissions) {
        if (difference(permissions, $doc.$permissions).length) {
            arePermsDisabled = false;
        } else arePermsDisabled = true;
    }
</script>

<svelte:head>
    <title>Appwrite - Document</title>
</svelte:head>

<Container>
    {#if $doc}
        <CardGrid>
            <h2 class="heading-level-7">Document</h2>
            <svelte:fragment slot="aside">
                <div>
                    <p>Created: {toLocaleDateTime($doc.$createdAt)}</p>
                    <p>Last Updated: {toLocaleDateTime($doc.$updatedAt)}</p>
                </div>
            </svelte:fragment>
        </CardGrid>
        <Document />

        <CardGrid>
            <h6 class="heading-level-7">Update Permissions</h6>
            <p>
                Assign read or write permissions at the <b> Collection Level</b> or
                <b> Document Level</b>. If collection Level permissions are assigned, permissions
                applied to individual documents are ignored.
            </p>

            <svelte:fragment slot="aside">
                <Permissions bind:permissions />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={arePermsDisabled}
                    on:click={() => {
                        updatePermissions();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <h6 class="heading-level-7">Delete document</h6>
            <p>
                The document will be permanently deleted, including all the data within it. This
                action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$doc.$id}</h6>
                    </svelte:fragment>
                    <p>
                        Last Updated: {toLocaleDateTime($doc.$updatedAt)}
                    </p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
