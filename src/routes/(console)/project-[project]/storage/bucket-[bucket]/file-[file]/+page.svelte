<script lang="ts">
    import { CardGrid, BoxAvatar, CopyInput, Empty } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { file } from './store';
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
        IconDotsHorizontal,
        IconDuplicate,
        IconPencil,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import ManageFileTokenModal, { cleanFormattedDate } from './manageFileToken.svelte';
    import { copy } from '$lib/helpers/copy';

    let showFileAlert = true;

    let showDelete = false;
    let arePermsDisabled = true;
    let filePermissions = $file?.$permissions;

    // TODO: @itznotabug update once backend is set up.
    let showManageToken = false;
    let tokenDeleteMode = false;
    // mock data
    $: fileTokens = []; // $file?.$tokens;
    let selectedFileToken: object | undefined = undefined;

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

    // mock method, change later.
    async function deleteFileToken(token: object) {
        fileTokens = fileTokens.filter((tokn) => {
            return tokn !== token;
        });
    }

    async function createFileToken(expiry: string) {
        const mockToken = {
            created: new Date().toISOString(),
            value: Math.random().toString(36).slice(-12),
            expiry: expiry,
            lastAccessed: Math.random() < 0.5 ? null : new Date('2024-02-15T15:30:00Z')
        };

        console.log(JSON.stringify(mockToken, null, 2));

        fileTokens = [...fileTokens, mockToken];
    }

    // TODO: update to manage file token expiry too later.
    async function updateFileTokenExpiry(newExpiry: string) {
        // perf hit but ok when testing!
        fileTokens = fileTokens.map((token) => {
            if (token === selectedFileToken) {
                token.expiry = newExpiry;
            }

            return token;
        });

        selectedFileToken = null;
    }

    async function copyPreviewWithToken(token: string) {
        await copy(
            `${sdk.forProject.storage.getFilePreview($file.bucketId, $file.$id)}&token=${token}`
        );
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
                            <span class="icon-external-link" aria-hidden="true" />
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
                    <span class="icon-download" aria-hidden="true" />
                    <span class="text"> Download</span></Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid hideOverflow>
            <svelte:fragment slot="title">File tokens</svelte:fragment>
            Use tokens to provide public access to the file.
            <svelte:fragment slot="aside">
                {#if fileTokens.length}
                    <Layout.Stack justifyContent="flex-end" direction="row">
                        <Button secondary on:click={() => (showManageToken = true)}>
                            <Icon size="s" icon={IconPlus} />
                            <span class="text">Create token</span>
                        </Button>
                    </Layout.Stack>

                    <Table.Root>
                        <svelte:fragment slot="header">
                            <Table.Header.Cell width="170px">Created</Table.Header.Cell>
                            <Table.Header.Cell width="170px">Value</Table.Header.Cell>
                            <Table.Header.Cell width="170px">Expiry</Table.Header.Cell>
                            <Table.Header.Cell width="170px">Last accessed</Table.Header.Cell>
                            <Table.Header.Cell width="40px" />
                        </svelte:fragment>

                        {#each fileTokens as token}
                            <Table.Row>
                                <Table.Cell>{toLocaleDate(token.created)}</Table.Cell>
                                <Table.Cell>
                                    <InteractiveText isVisible={false} text={token.value} />
                                </Table.Cell>
                                <Table.Cell
                                    >{token.expiry
                                        ? cleanFormattedDate(token.expiry)
                                        : 'Never'}</Table.Cell>
                                <Table.Cell
                                    >{token.lastAccessed
                                        ? cleanFormattedDate(token.lastAccessed)
                                        : 'Never'}</Table.Cell>

                                <Table.Cell>
                                    <Popover placement="bottom-end" padding="none" let:toggle>
                                        <PinkButton.Button
                                            icon
                                            variant="ghost"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                toggle(e);
                                            }}>
                                            <Icon size="s" icon={IconDotsHorizontal} />
                                        </PinkButton.Button>
                                        <svelte:fragment slot="tooltip" let:toggle>
                                            <ActionMenu.Root>
                                                <ActionMenu.Item.Button
                                                    leadingIcon={IconDuplicate}
                                                    on:click={(e) => {
                                                        toggle(e);
                                                        copyPreviewWithToken(token.value);
                                                    }}>
                                                    Copy URL
                                                </ActionMenu.Item.Button>
                                                <ActionMenu.Item.Button
                                                    leadingIcon={IconPencil}
                                                    on:click={(e) => {
                                                        toggle(e);
                                                        showManageToken = true;
                                                        selectedFileToken = token;
                                                    }}>
                                                    Edit expiry
                                                </ActionMenu.Item.Button>
                                                <ActionMenu.Item.Button
                                                    status="danger"
                                                    leadingIcon={IconTrash}
                                                    on:click={async (e) => {
                                                        toggle(e);
                                                        tokenDeleteMode = true;
                                                        showManageToken = true;
                                                        selectedFileToken = token;
                                                    }}>
                                                    Delete
                                                </ActionMenu.Item.Button>
                                            </ActionMenu.Root>
                                        </svelte:fragment>
                                    </Popover>
                                </Table.Cell>
                            </Table.Row>
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
                            If you want to assign document permissions. Go to Bucket settings and
                            enable file security. Otherwise, only Bucket permissions will be used.
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
    on:updated={({ detail: newExpiry }) => updateFileTokenExpiry(newExpiry)}
    on:deleted={async () => await deleteFileToken(selectedFileToken)} />
