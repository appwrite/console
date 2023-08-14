<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardGrid, Box, Heading, Alert } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { doc } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Delete from './delete.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { collection } from '../store';

    const projectId = $page.params.project;

    let showDelete = false;
    let permissions = $doc?.$permissions;
    let arePermsDisabled = true;
    let showPermissionAlert = true;

    async function updatePermissions() {
        try {
            await sdk.forProject.databases.updateDocument(
                $doc.$databaseId,
                $doc.$collectionId,
                $doc.$id,
                $doc.data,
                permissions
            );
            await invalidate(Dependencies.DOCUMENT);
            arePermsDisabled = true;
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.DocumentUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DocumentUpdatePermissions);
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
        <Heading tag="h2" size="7">Metadata</Heading>
        <svelte:fragment slot="aside">
            <div>
                <p>Created: {toLocaleDateTime($doc.$createdAt)}</p>
                <p>Last Updated: {toLocaleDateTime($doc.$updatedAt)}</p>
            </div>
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">Permissions</Heading>
        <p>
            Assign read or write permissions at the <b> collection level</b> or
            <b> document level</b>. If collection level permissions are assigned, permissions
            applied to individual documents are ignored.
        </p>
        <svelte:fragment slot="aside">
            {#if $collection.documentSecurity}
                {#if showPermissionAlert}
                    <Alert type="info" dismissible on:dismiss={() => (showPermissionAlert = false)}>
                        <svelte:fragment slot="title">Document security is enabled</svelte:fragment>
                        <p class="text">
                            Users will be able to access this document if they have been granted <b
                                >either Document or Collection permissions.
                            </b>
                        </p>
                    </Alert>
                {/if}
                {#if permissions}
                    <Permissions bind:permissions />
                {/if}
            {:else}
                <Alert type="info">
                    <svelte:fragment slot="title">Document security is disabled</svelte:fragment>
                    <p>
                        Go to <a
                            href={`${base}/console/project-${projectId}/databases/database-${$doc.$databaseId}/collection-${$doc.$collectionId}/settings`}
                            class="link">
                            collection settings</a> to enable document level permissions.
                    </p>
                </Alert>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={arePermsDisabled}
                on:click={() => {
                    updatePermissions();
                }}>Update</Button>
        </svelte:fragment>
    </CardGrid>

    <CardGrid danger>
        <Heading tag="h6" size="7">Delete document</Heading>
        <p>
            The document will be permanently deleted, including all the data within it. This action
            is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{$doc.$id}</h6>
                </svelte:fragment>
                <p>
                    Last updated: {toLocaleDateTime($doc.$updatedAt)}
                </p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
