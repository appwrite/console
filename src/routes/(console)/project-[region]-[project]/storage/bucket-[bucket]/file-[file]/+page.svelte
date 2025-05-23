<script lang="ts">
    import { CardGrid, BoxAvatar, CopyInput, Empty } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { columns, file, tokens } from './store';
    import { diffDays, toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { onMount } from 'svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Permissions } from '$lib/components/permissions';
    import Delete from './deleteFile.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { bucket } from '../store';
    import { page } from '$app/state';
    import {
        ActionMenu,
        Alert,
        Badge,
        Button as PinkButton,
        Layout,
        Icon,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconDuplicate,
        IconPencil,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import FileTokensCopyUrl from './fileTokensCopyUrl.svelte';
    import ManageFileTokenModal, { cleanFormattedDate } from './manageFileToken.svelte';
    import { type Models } from '@appwrite.io/console';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { Menu } from '$lib/components/menu';

    let showFileAlert = true;

    let showDelete = false;
    let arePermsDisabled = true;
    let filePermissions = $file?.$permissions;

    let showManageToken = false;
    let tokenDeleteMode = false;
    let showCopyUrlModal = false;
    let selectedFileToken: Models.ResourceToken | null = null;

    const getPreview = (fileId: string) =>
        sdk
            .forProject(page.params.region, page.params.project)
            .storage.getFilePreview($file.bucketId, fileId, 640, 300)
            .toString() + '&mode=admin';
    const getView = (fileId: string) =>
        sdk
            .forProject(page.params.region, page.params.project)
            .storage.getFileView($file.bucketId, fileId)
            .toString() + '&mode=admin';

    $: if (filePermissions) {
        arePermsDisabled = !symmetricDifference(filePermissions, $file.$permissions).length;
    }

    function downloadFile() {
        return (
            sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFileDownload($file.bucketId, $file.$id)
                .toString() + '&mode=admin'
        );
    }

    async function updatePermissions() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .storage.updateFile($file.bucketId, $file.$id, $file.name, filePermissions);
            await invalidate(Dependencies.FILE);
            arePermsDisabled = true;
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.FileUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FileUpdatePermissions);
        } finally {
            selectedFileToken = null;
        }
    }

    async function deleteFileToken(token: Models.ResourceToken) {
        try {
            await sdk.forProject(page.params.region, page.params.project).tokens.delete(token.$id);
            await invalidate(Dependencies.FILE_TOKENS);
            addNotification({
                message: 'File token deleted',
                type: 'success'
            });
            trackEvent(Submit.FileTokenDelete);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FileTokenDelete);
        } finally {
            selectedFileToken = null;
        }
    }

    async function createFileToken(expiry: string) {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .tokens.createFileToken($file.bucketId, $file.$id, expiry);

            await invalidate(Dependencies.FILE_TOKENS);
            addNotification({
                message: 'File token created',
                type: 'success'
            });
            trackEvent(Submit.FileTokenCreate);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FileTokenCreate);
        } finally {
            selectedFileToken = null;
        }
    }

    async function updateFileToken(fileToken: Models.ResourceToken) {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .tokens.update(selectedFileToken.$id, fileToken.expire ? fileToken.expire : null);
            await invalidate(Dependencies.FILE_TOKENS);
            addNotification({
                message: 'File token updated',
                type: 'success'
            });
            trackEvent(Submit.FileTokenUpdate);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FileTokenUpdate);
        } finally {
            selectedFileToken = null;
        }
    }

    function getExpiryDetails(token: Models.ResourceToken): {
        status: 'success' | 'warning' | 'error' | null;
        message: string | null;
    } {
        if (token.expire === '') token.expire = null;
        const isExpired = token.expire !== null && new Date(token.expire) < new Date();
        const isExpiring = token.expire && diffDays(new Date(), new Date(token.expire)) < 14;

        return {
            status: isExpired ? 'error' : isExpiring ? 'warning' : null,
            message: isExpired ? 'Expired' : isExpiring ? 'Expires soon' : null
        };
    }

    onMount(async () => {
        filePermissions = $file?.$permissions;
    });
</script>

<Container>
    {#if $file}
        <CardGrid>
            <div class="u-flex u-gap-16" data-private>
                <a
                    href={getView($file.$id)}
                    class="file-preview is-with-image"
                    target="_blank"
                    rel="noopener noreferrer"
                    style:inline-size="100%"
                    aria-label="open file in new window">
                    <div class="file-preview-image">
                        <img
                            width="205"
                            height="125"
                            src={getPreview($file.$id)}
                            alt={$file.name} />
                    </div>
                    <div class="file-preview-content">
                        <div class="avatar">
                            <span class="icon-external-link" aria-hidden="true"></span>
                        </div>
                    </div>
                </a>
            </div>
            <svelte:fragment slot="aside">
                <div>
                    <p>
                        <span class="u-bold">Filename:</span>
                        <span class="u-trim">{$file.name}</span>
                    </p>
                    <p><span class="u-bold">MIME type:</span> {$file.mimeType}</p>
                    <p><span class="u-bold">Size:</span> {calculateSize($file.sizeOriginal)}</p>
                    <p><span class="u-bold">Created:</span> {toLocaleDate($file.$createdAt)}</p>
                    <p>
                        <span class="u-bold">Last updated:</span>
                        {toLocaleDate($file.$updatedAt)}
                    </p>
                </div>
                <CopyInput label="File URL" value={getView($file.$id)} />
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary href={downloadFile()} event="download_file" external>
                    <span class="icon-download" aria-hidden="true"></span>
                    <span class="text"> Download</span></Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <svelte:fragment slot="title">File tokens</svelte:fragment>
            Use tokens to provide public access to the file.
            <svelte:fragment slot="aside">
                {#if $tokens.total}
                    <Layout.Stack
                        justifyContent="flex-end"
                        direction={$isSmallViewport ? 'column' : 'row'}>
                        <Button secondary on:click={() => (showManageToken = true)}>
                            <Icon size="s" icon={IconPlus} />
                            <span class="text">Create token</span>
                        </Button>
                    </Layout.Stack>

                    <Table.Root columns={$columns} let:root>
                        <svelte:fragment slot="header" let:root>
                            {#each $columns as { id, title } (id)}
                                <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
                            {/each}
                        </svelte:fragment>

                        {#each $tokens.tokens as token}
                            <Table.Row.Base {root}>
                                <Table.Cell column="created" {root}
                                    >{toLocaleDate(token.$createdAt)}</Table.Cell>

                                <Table.Cell column="expire" {root}>
                                    <Layout.Stack gap="s" direction="row">
                                        {@const expiration = getExpiryDetails(token)}
                                        {token.expire ? cleanFormattedDate(token.expire) : 'Never'}

                                        {#if expiration.status}
                                            <Badge
                                                size="s"
                                                variant="secondary"
                                                type={expiration.status}
                                                content={expiration.message} />
                                        {/if}
                                    </Layout.Stack>
                                </Table.Cell>

                                <Table.Cell column="last_accessed" {root}
                                    >{token.accessedAt
                                        ? cleanFormattedDate(token.accessedAt, true)
                                        : 'Never'}</Table.Cell>

                                <Table.Cell column="actions" {root}>
                                    <Layout.Stack alignItems="flex-end">
                                        <Menu>
                                            <PinkButton.Button icon variant="ghost">
                                                <Icon size="s" icon={IconDotsHorizontal} />
                                            </PinkButton.Button>

                                            <svelte:fragment slot="menu" let:toggle>
                                                <ActionMenu.Root>
                                                    <ActionMenu.Root noPadding>
                                                        <ActionMenu.Item.Button
                                                            on:click={() => {
                                                                toggle();
                                                                showCopyUrlModal = true;
                                                                selectedFileToken = token;
                                                            }}
                                                            leadingIcon={IconDuplicate}>
                                                            Copy URL
                                                        </ActionMenu.Item.Button>
                                                    </ActionMenu.Root>
                                                    <ActionMenu.Item.Button
                                                        leadingIcon={IconPencil}
                                                        on:click={() => {
                                                            toggle();
                                                            showManageToken = true;
                                                            selectedFileToken = token;
                                                        }}>
                                                        Edit expiry
                                                    </ActionMenu.Item.Button>
                                                    <ActionMenu.Item.Button
                                                        status="danger"
                                                        leadingIcon={IconTrash}
                                                        on:click={() => {
                                                            toggle();
                                                            tokenDeleteMode = true;
                                                            showManageToken = true;
                                                            selectedFileToken = token;
                                                        }}>
                                                        Delete
                                                    </ActionMenu.Item.Button>
                                                </ActionMenu.Root>
                                            </svelte:fragment>
                                        </Menu>
                                    </Layout.Stack>
                                </Table.Cell>
                            </Table.Row.Base>
                        {/each}
                    </Table.Root>
                {:else}
                    <Empty on:click={() => (showManageToken = true)}>Create new file token</Empty>
                {/if}
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <svelte:fragment slot="title">Permissions</svelte:fragment>
            Assign read or write permissions at the bucket level or file level. If bucket level permissions
            are enabled, file permissions will be ignored.
            <svelte:fragment slot="aside">
                {#if $bucket.fileSecurity}
                    {#if showFileAlert}
                        <Alert.Inline status="info" title="File security is enabled">
                            <Typography.Text>
                                Users will be able to access this file if they have been granted <b
                                    >either File or Bucket permissions.
                                </b>
                            </Typography.Text>
                        </Alert.Inline>
                    {/if}
                    <Permissions bind:permissions={filePermissions} />
                {:else}
                    <Alert.Inline status="info" title="File security is disabled">
                        <Typography.Text>
                            If you want to assign file permissions. Go to Bucket settings and enable
                            file security. Otherwise, only Bucket permissions will be used.
                        </Typography.Text>
                    </Alert.Inline>
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

        <CardGrid>
            <svelte:fragment slot="title">Delete file</svelte:fragment>
            The file will be permanently deleted. This action is irreversible.
            <svelte:fragment slot="aside">
                <BoxAvatar>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1" data-private>{$file.name}</h6>
                    </svelte:fragment>
                    <p>
                        Last updated: {toLocaleDateTime($file.$updatedAt)}
                    </p>
                </BoxAvatar>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)} event="delete_file">
                    Delete
                </Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />

<ManageFileTokenModal
    bind:show={showManageToken}
    bind:isDelete={tokenDeleteMode}
    bind:fileToken={selectedFileToken}
    on:created={({ detail: expiry }) => createFileToken(expiry)}
    on:updated={({ detail: token }) => updateFileToken(token)}
    on:deleted={async () => await deleteFileToken(selectedFileToken)} />

<FileTokensCopyUrl file={$file} bind:token={selectedFileToken} bind:show={showCopyUrlModal} />
