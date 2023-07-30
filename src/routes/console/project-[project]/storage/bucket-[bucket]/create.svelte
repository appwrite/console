<script lang="ts">
    import { Button, FormList, InputFile } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { Modal, CustomId, Heading, Alert } from '$lib/components';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import { uploader } from '$lib/stores/uploader';
    import { bucket } from './store';
    import { Permissions } from '$lib/components/permissions';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

    export let showCreate = false;

    const bucketId = $page.params.bucket;
    const dispatch = createEventDispatcher();

    let files: FileList;
    let permissions: string[] = [];
    let id: string = null;
    let error: string;
    let showCustomId = false;

    async function create() {
        try {
            showCreate = false;
            await uploader.uploadFile(bucketId, id ?? ID.unique(), files[0], permissions);
            files = null;
            showCustomId = false;
            dispatch('created');
            addNotification({
                type: 'success',
                message: `File has been uploaded`
            });
            trackEvent(Submit.FileCreate, {
                customId: !!id
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.FileCreate);
        }
    }

    $: if (!showCreate) {
        id = files = error = null;
        permissions = [];
    }
</script>

<Modal size="big" {error} bind:show={showCreate} onSubmit={create}>
    <svelte:fragment slot="header"
        >{$LL.console.project.forms.storage.title.createFile()}</svelte:fragment>
    <FormList>
        <div>
            <InputFile
                bind:files
                allowedFileExtensions={$bucket.allowedFileExtensions}
                maxSize={$bucket.maximumFileSize} />
        </div>

        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}>
                    <span class="icon-pencil" aria-hidden="true" /><span class="text">
                        {$LL.console.project.table.pill.fileId()}
                    </span>
                </Pill>
            </div>
        {:else}
            <CustomId bind:show={showCustomId} name="File" bind:id />
        {/if}
        <Heading tag="h6" size="7">{$LL.console.project.title.permissions()}</Heading>
        <p class="text">
            {$LL.console.project.texts.storage.accessPermission()}
            <a
                href="https://appwrite.io/docs/permissions"
                target="_blank"
                rel="noopener noreferrer"
                class="link">
                {$LL.console.project.texts.storage.permissionGuide()}
            </a>.
        </p>
        {#if $bucket.fileSecurity}
            <div class="common-section">
                <Alert type="info">
                    <svelte:fragment slot="title"
                        >{$LL.console.project.texts.storage.fileSecurity.enable()}</svelte:fragment>
                    {$LL.console.project.texts.storage.userAccessability()}
                    <b>{$LL.console.project.texts.storage.fileAndBucketPermissionss()}</b>.
                </Alert>
            </div>
            <div class="common-section">
                <Permissions bind:permissions />
            </div>
        {:else}
            <Alert type="info">
                <svelte:fragment slot="title"
                    >{$LL.console.project.texts.storage.fileSecurity.disable()}</svelte:fragment>
                {$LL.console.project.texts.storage.assignFilePermission()}
            </Alert>
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button submit>{$LL.console.project.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
