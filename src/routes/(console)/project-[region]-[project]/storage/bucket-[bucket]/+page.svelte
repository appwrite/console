<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Avatar, Empty, EmptySearch, PaginationWithLimit, SearchQuery } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Badge } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { addNotification } from '$lib/stores/notifications';
    import { uploader } from '$lib/stores/uploader';
    import { sdk } from '$lib/stores/sdk.js';
    import DeleteFile from './deleteFile.svelte';
    import { bucket } from './store';
    import Confirm from '$lib/components/confirm.svelte';
    import {
        Layout,
        Table,
        Icon,
        Popover,
        ActionMenu,
        FloatingActionBar,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import {
        IconDotsHorizontal,
        IconPencil,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    export let data;

    let showDelete = false;
    let selectedFile: Models.File = null;
    let selectedFiles: string[] = [];
    let showBulkDelete = false;
    let deleting = false;

    const bucketId = page.params.bucket;

    function getPreview(fileId: string) {
        return (
            sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFilePreview({
                    bucketId,
                    fileId,
                    height: 128,
                    width: 128
                })
                .toString() + '&mode=admin'
        );
    }

    async function fileDeleted(event: CustomEvent<Models.File>) {
        showDelete = false;
        await uploader.removeFile(event.detail);
        await invalidate(Dependencies.FILES);
    }

    async function deleteFile(file: Models.File) {
        selectedFile = file;
        showDelete = true;
    }

    async function handleBulkDelete() {
        showBulkDelete = false;
        deleting = true;

        const promises = selectedFiles.map((fileId) =>
            sdk.forProject(page.params.region, page.params.project).storage.deleteFile({
                bucketId,
                fileId
            })
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.FileDelete, {
                total: selectedFiles.length
            });
            addNotification({
                type: 'success',
                message: `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.FILES);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FileDelete);
        } finally {
            selectedFiles = [];
            showBulkDelete = false;
            deleting = false;
        }
    }

    let isUploading = false;

    const beforeunload = (event: BeforeUnloadEvent) => {
        // legacy browser **may** support showing a custom message.
        const message = 'An upload is in progress. Are you sure you want to leave?';

        if (isUploading) {
            event.preventDefault();
            event.returnValue = message;
            return message;
        }
    };

    onMount(() => {
        return uploader.subscribe(() => {
            isUploading = $uploader.files.some(
                (file) =>
                    file.status !== 'success' && file.progress < 100 && file.status !== 'failed'
            );
        });
    });
</script>

<svelte:window on:beforeunload={beforeunload} />

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search files" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Button
                href={`${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/create`}
                event="create_file"
                size="s">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create file
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if data.files.total}
        <Table.Root
            let:root
            allowSelection
            bind:selectedRows={selectedFiles}
            columns={[
                { id: 'filename', width: $isSmallViewport ? 24 : undefined },
                { id: 'type', width: { min: 140 } },
                { id: 'size', width: { min: 100 } },
                { id: 'created', width: { min: 120 } },
                { id: 'actions', width: 40 }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="filename" {root}>Filename</Table.Header.Cell>
                <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
                <Table.Header.Cell column="size" {root}>Size</Table.Header.Cell>
                <Table.Header.Cell column="created" {root}>Created</Table.Header.Cell>
                <Table.Header.Cell column="actions" {root} />
            </svelte:fragment>
            {#each data.files.files as file}
                {#if file.chunksTotal / file.chunksUploaded !== 1}
                    <Table.Row.Base {root} id={file.$id}>
                        <Table.Cell column="filename" {root}>
                            <Layout.Stack direction="row" alignItems="center">
                                <span class="avatar is-size-small is-color-empty"></span>
                                <span class="text u-trim">{file.name}</span>
                                <div>
                                    <Badge variant="secondary" type="warning" content="Pending" />
                                </div>
                            </Layout.Stack>
                        </Table.Cell>
                        <Table.Cell column="type" {root}>{file.mimeType}</Table.Cell>
                        <Table.Cell column="size" {root}>
                            {calculateSize(file.sizeOriginal)}
                        </Table.Cell>
                        <Table.Cell column="created" {root}>
                            <DualTimeView time={file.$createdAt} />
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <div class="u-flex u-main-center">
                                <button
                                    class="button is-only-icon is-text"
                                    aria-label="Delete item"
                                    on:click|preventDefault={() => deleteFile(file)}>
                                    <span class="icon-trash" aria-hidden="true"></span>
                                </button>
                            </div>
                        </Table.Cell>
                    </Table.Row.Base>
                {:else}
                    {@const href = `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${bucketId}/file-${file.$id}`}
                    <Table.Row.Link {href} {root} id={file.$id}>
                        <Table.Cell column="filename" {root}>
                            <div class="u-flex u-gap-12 u-cross-center">
                                <Avatar size="xs" src={getPreview(file.$id)} alt={file.name} />
                                <span class="text u-trim">{file.name}</span>
                            </div>
                        </Table.Cell>
                        <Table.Cell column="type" {root}>{file.mimeType}</Table.Cell>
                        <Table.Cell column="size" {root}>
                            {calculateSize(file.sizeOriginal)}
                        </Table.Cell>
                        <Table.Cell column="created" {root}>
                            <DualTimeView time={file.$createdAt} />
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <Popover let:toggle placement="bottom-start" padding="none">
                                <Button
                                    text
                                    icon
                                    ariaLabel="more options"
                                    on:click={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        toggle();
                                    }}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip">
                                    <ActionMenu.Item.Anchor {href} leadingIcon={IconPencil}>
                                        Update
                                    </ActionMenu.Item.Anchor>
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconTrash}
                                        on:click={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            selectedFile = file;
                                            showDelete = true;
                                        }}>
                                        Delete
                                    </ActionMenu.Item.Button>
                                </ActionMenu.Root>
                            </Popover>
                        </Table.Cell>
                    </Table.Row.Link>
                {/if}
            {/each}
        </Table.Root>

        <PaginationWithLimit
            name="Files"
            limit={data.limit}
            offset={data.offset}
            total={data.files.total} />
    {:else if data.search}
        <EmptySearch target="files" search={data.search} hidePagination={data.files.total === 0}>
            <Button
                secondary
                size="s"
                href={`${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${bucketId}`}>
                Clear Search
            </Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/storage"
            target="file"
            allowCreate
            on:click={() =>
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${bucketId}/create`
                )} />
    {/if}

    {#if selectedFiles.length > 0}
        <FloatingActionBar>
            <svelte:fragment slot="start">
                <Badge content={selectedFiles.length.toString()} />
                <span>
                    {selectedFiles.length > 1 ? 'files' : 'file'}
                    selected
                </span>
            </svelte:fragment>
            <svelte:fragment slot="end">
                <Button text on:click={() => (selectedFiles = [])}>Cancel</Button>
                <Button secondary on:click={() => (showBulkDelete = true)}>Delete</Button>
            </svelte:fragment>
        </FloatingActionBar>
    {/if}
</Container>

<DeleteFile bind:showDelete file={selectedFile} on:deleted={fileDeleted} />

<Confirm
    title="Delete files"
    bind:open={showBulkDelete}
    onSubmit={handleBulkDelete}
    disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedFiles.length}</b>
        {selectedFiles.length > 1 ? 'files' : 'file'} from <b>{$bucket?.name}</b>?
    </Typography.Text>
    <Typography.Text>
        This action is irreversible and will permanently remove the selected files.
    </Typography.Text>
</Confirm>
