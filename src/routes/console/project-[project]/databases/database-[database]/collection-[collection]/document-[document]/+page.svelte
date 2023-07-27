<script lang="ts">
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
    import LL from '$i18n/i18n-svelte';

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
    <title>{$LL.console.project.title.document()} - Appwrite</title>
</svelte:head>

<Container>
    <CardGrid>
        <Heading tag="h2" size="7">{$LL.console.project.title.metaData()}</Heading>
        <svelte:fragment slot="aside">
            <div>
                <p>
                    {$LL.console.project.texts.databases.created()}{' '}{toLocaleDateTime(
                        $doc.$createdAt
                    )}
                </p>
                <p>
                    {$LL.console.project.texts.databases.lastUpdated()}{' '}{toLocaleDateTime(
                        $doc.$updatedAt
                    )}
                </p>
            </div>
        </svelte:fragment>
    </CardGrid>
    <CardGrid>
        <Heading tag="h6" size="7">{$LL.console.project.title.permissions()}</Heading>
        <p>
            {$LL.console.project.texts.databases.documentsPage.para.phraseOne()}{' '}<b
                >{$LL.console.project.texts.databases.documentsPage.para.collectionLevel()}</b
            >{' '}{$LL.console.project.texts.databases.documentsPage.para.or()}<b
                >{' '}{$LL.console.project.texts.databases.documentsPage.para.documentLevel()}</b
            >.{' '}{$LL.console.project.texts.databases.documentsPage.para.phraseTwo()}
        </p>

        <svelte:fragment slot="aside">
            {#if $collection.documentSecurity}
                {#if showPermissionAlert}
                    <Alert type="info" dismissible on:dismiss={() => (showPermissionAlert = false)}>
                        <svelte:fragment slot="title"
                            >{$LL.console.project.alert.databases.title.documentSecurity.enabled()}</svelte:fragment>
                        <p class="text">
                            {$LL.console.project.alert.databases.title.userPermission()}{' '}<b
                                >{$LL.console.project.alert.databases.title.collectionPermission()}
                            </b>
                        </p>
                    </Alert>
                {/if}
                {#if permissions}
                    <Permissions bind:permissions />
                {/if}
            {:else}
                <Alert type="info">
                    <svelte:fragment slot="title"
                        >{$LL.console.project.alert.databases.title.documentSecurity.disabled()}</svelte:fragment>
                    <p class="text">
                        {$LL.console.project.alert.databases.title.permissionCheck()}
                    </p>
                </Alert>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={arePermsDisabled}
                on:click={() => {
                    updatePermissions();
                }}>{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>

    <CardGrid danger>
        <Heading tag="h6" size="7">{$LL.console.project.title.deleteDocument()}</Heading>
        <p>
            {$LL.console.project.texts.database.deleteDocWarning()}
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{$doc.$id}</h6>
                </svelte:fragment>
                <p>
                    {$LL.console.project.texts.database.lastUpdated()}{' '}{toLocaleDateTime(
                        $doc.$updatedAt
                    )}
                </p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}
                >{$LL.console.project.button.submit.delete()}</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
