<script lang="ts">
    import { CardGrid, Box, Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { doc } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Document from './document.svelte';
    import Delete from './delete.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

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
            invalidate(Dependencies.DOCUMENT);
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
        if (symmetricDifference(permissions, $doc.$permissions).length) {
            arePermsDisabled = false;
        } else arePermsDisabled = true;
    }
</script>

<svelte:head>
    <title>Document - Appwrite</title>
</svelte:head>

<Container>
    <CardGrid>
        <Heading tag="h2" size="7">Document</Heading>
        <svelte:fragment slot="aside">
            <div>
                <p>Created: {toLocaleDateTime($doc.$createdAt)}</p>
                <p>Last Updated: {toLocaleDateTime($doc.$updatedAt)}</p>
            </div>
        </svelte:fragment>
    </CardGrid>
    <Document />
    <CardGrid>
        <Heading tag="h6" size="7">Update Permissions</Heading>
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
        <Heading tag="h6" size="7">Delete Document</Heading>
        <p>
            The document will be permanently deleted, including all the data within it. This action
            is irreversible.
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
</Container>

<Delete bind:showDelete />
