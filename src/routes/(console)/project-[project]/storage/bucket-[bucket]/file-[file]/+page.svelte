<script lang="ts">
    import { CardGrid, BoxAvatar, CopyInput, Empty } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { columns, file, tokens } from './store';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
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
    import {
        ActionMenu,
        Alert,
        Button as PinkButton,
        InteractiveText,
        Layout,
        Icon,
        Popover,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import {
        IconChevronRight,
        IconDotsHorizontal,
        IconDuplicate,
        IconKey,
        IconPencil,
        IconPlus,
        IconTrash,
    } from '@appwrite.io/pink-icons-svelte';
    import ManageFileTokenModal, { cleanFormattedDate } from './manageFileToken.svelte';
    import { copy } from '$lib/helpers/copy';
    import { type Models, Permission, Role } from '@appwrite.io/console';
    import { isSmallViewport } from '$lib/stores/viewport';
    import SubMenu from '../../../../../../lib/components/menu/subMenu.svelte';
    import { Menu } from '$lib/components/menu';

    let showFileAlert = true;

    let showDelete = false;
    let arePermsDisabled = true;
    let filePermissions = $file?.$permissions;

    let showManageToken = false;
    let tokenDeleteMode = false;
    let tokenPermissionsMode = false;
    let selectedFileToken: Models.ResourceToken | null = null;

    const getPreview = (fileId: string) =>
        sdk.forProject.storage.getFilePreview($file.bucketId, fileId, 640, 300).toString() +
        '&mode=admin';

    const getView = (fileId: string) =>
        sdk.forProject.storage.getFileView($file.bucketId, fileId).toString() + '&mode=admin';

    $: if (filePermissions) {
        arePermsDisabled = !symmetricDifference(filePermissions, $file.$permissions).length;
    }

    function downloadFile() {
        return (
            sdk.forProject.storage.getFileDownload($file.bucketId, $file.$id).toString() +
            '&mode=admin'
        );
    }

    async function updatePermissions() {
        try {
            await sdk.forProject.storage.updateFile(
                $file.bucketId,
                $file.$id,
                $file.name,
                filePermissions
            );
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
        }
    }

    async function deleteFileToken(token: Models.ResourceToken) {
        try {
            await sdk.forProject.tokens.delete(token.$id);
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
        }
    }

    async function createFileToken(expiry: string) {
        try {
            await sdk.forProject.tokens.createFileToken($file.bucketId, $file.$id, expiry, [
                Permission.read(Role.any())
            ]);

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
        }
    }

    async function updateFileToken(fileToken: Models.ResourceToken) {
        try {
            await sdk.forProject.tokens.update(
                selectedFileToken.$id,
                fileToken.expire ? fileToken.expire : null,
                fileToken.$permissions
            );
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

    async function copyPreviewWithToken(
        token: Models.ResourceToken,
        method: 'preview' | 'view' | 'download' = 'preview'
    ) {
        try {
            const { jwt } = await sdk.forProject.tokens.getJWT(token.$id);
            let url: string;

            if (method === 'view') {
                url = sdk.forProject.storage.getFileView($file.bucketId, $file.$id);
            } else if (method === 'download') {
                url = sdk.forProject.storage.getFileDownload($file.bucketId, $file.$id);
            } else {
                url = sdk.forProject.storage.getFilePreview($file.bucketId, $file.$id);
            }

            await copy(`${url}&token=${jwt}`);

            addNotification({
                message: 'File URL copied',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    function getPermissionGroups(permissions: string[]): string {
        const map = {
            read: 'Read',
            update: 'Update',
            delete: 'Delete'
        };

        const groups = permissions.reduce((set, perm) => {
            const match = perm.match(/^(\w+)\(/);
            const key = match?.[1];
            if (key && map[key]) set.add(map[key]);
            return set;
        }, new Set<string>());

        return [...groups].join(', ');
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
                    <p><span class="u-bold">Filename:</span> {$file.name}</p>
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

        <div class="tokens-section">
            <CardGrid hideOverflow>
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
                                    <Table.Header.Cell column={id} {root}
                                        >{title}</Table.Header.Cell>
                                {/each}
                            </svelte:fragment>

                            {#each $tokens.tokens as token}
                                <Table.Row.Base {root}>
                                    <Table.Cell column="created" {root}
                                        >{toLocaleDate(token.$createdAt)}</Table.Cell>

                                    <Table.Cell column="expiry" {root}
                                        >{token.expire
                                            ? cleanFormattedDate(token.expire)
                                            : 'never'}</Table.Cell>

                                    <Table.Cell column="last_accessed" {root}
                                        >{token.accessedAt
                                            ? cleanFormattedDate(token.accessedAt, true)
                                            : 'never'}</Table.Cell>

                                    <Table.Cell column="permissions" {root}>
                                        {#if token.$permissions.length}
                                            <Typography.Text truncate slot="tooltip">
                                                {getPermissionGroups(token.$permissions)}
                                            </Typography.Text>
                                        {:else}
                                            none
                                        {/if}
                                    </Table.Cell>

                                    <Table.Cell column="actions" {root}>
                                        <Layout.Stack alignItems="flex-end">
                                            <Menu>
                                                <!-- CTA for menu open -->
                                                <PinkButton.Button icon variant="ghost">
                                                    <Icon size="s" icon={IconDotsHorizontal} />
                                                </PinkButton.Button>

                                                <svelte:fragment slot="menu" let:toggle>
                                                    <ActionMenu.Root>
                                                        <SubMenu>
                                                            <ActionMenu.Root noPadding>
                                                                <ActionMenu.Item.Button
                                                                    leadingIcon={IconDuplicate}
                                                                    trailingIcon={IconChevronRight}>
                                                                    Copy URL
                                                                </ActionMenu.Item.Button>
                                                            </ActionMenu.Root>
                                                            <svelte:fragment slot="menu">
                                                                <ActionMenu.Root noPadding>
                                                                    <ActionMenu.Item.Button
                                                                        on:click={(e) => {
                                                                            toggle(e);
                                                                            copyPreviewWithToken(
                                                                                token
                                                                            );
                                                                        }}>
                                                                        Preview
                                                                    </ActionMenu.Item.Button>
                                                                    <ActionMenu.Item.Button
                                                                        on:click={(e) => {
                                                                            toggle(e);
                                                                            copyPreviewWithToken(
                                                                                token,
                                                                                'view'
                                                                            );
                                                                        }}>
                                                                        View
                                                                    </ActionMenu.Item.Button>
                                                                    <ActionMenu.Item.Button
                                                                        on:click={(e) => {
                                                                            toggle(e);
                                                                            copyPreviewWithToken(
                                                                                token,
                                                                                'download'
                                                                            );
                                                                        }}>
                                                                        Download
                                                                    </ActionMenu.Item.Button>
                                                                </ActionMenu.Root>
                                                            </svelte:fragment>
                                                        </SubMenu>
                                                        <ActionMenu.Item.Button
                                                            leadingIcon={IconPencil}
                                                            on:click={(e) => {
                                                                showManageToken = true;
                                                                selectedFileToken = token;
                                                            }}>
                                                            Edit expiry
                                                        </ActionMenu.Item.Button>
                                                        <ActionMenu.Item.Button
                                                            leadingIcon={IconKey}
                                                            on:click={(e) => {
                                                                showManageToken = true;
                                                                tokenPermissionsMode = true;
                                                                selectedFileToken = token;
                                                            }}>
                                                            Edit Permissions
                                                        </ActionMenu.Item.Button>
                                                        <ActionMenu.Item.Button
                                                            status="danger"
                                                            leadingIcon={IconTrash}
                                                            on:click={async (e) => {
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
                        <Empty on:click={() => (showManageToken = true)}
                            >Create new file token</Empty>
                    {/if}
                </svelte:fragment>
            </CardGrid>
        </div>

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
    bind:isUpdatePermissions={tokenPermissionsMode}
    on:created={({ detail: expiry }) => createFileToken(expiry)}
    on:updated={({ detail: token }) => updateFileToken(token)}
    on:deleted={async () => await deleteFileToken(selectedFileToken)} />

<style>
    :global(.tokens-section div) {
        overflow: auto;
    }
</style>
