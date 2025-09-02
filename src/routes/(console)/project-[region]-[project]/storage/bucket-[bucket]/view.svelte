<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Avatar, Empty, EmptySearch, PaginationWithLimit, SearchQuery } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Badge } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import type { Models } from '@appwrite.io/console';
    import { addNotification } from '$lib/stores/notifications';
    import { uploader } from '$lib/stores/uploader';
    import { sdk } from '$lib/stores/sdk.js';
    import DeleteFile from './deleteFile.svelte';
    import { Layout, Table, Icon, Popover, ActionMenu } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { IconDotsHorizontal, IconPencil, IconPlus, IconTrash } from '@appwrite.io/pink-icons-svelte';

    let {
        files,
        limit,
        offset,
        search,
        createFileUrl
    }: {
        files: { total: number; files: Models.File[] };
        limit: number;
        offset: number;
        search: string | null;
        createFileUrl?: (file: Models.File) => string;
    } = $props();

    let showDelete = $state(false);
    let selectedFile = $state<Models.File | null>(null);

    const bucketId = page.params.bucket;
    const clearSearchHref = page.url.pathname;

    function getPreview(fileId: string) {
        return (
            sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFilePreview({ bucketId, fileId, height: 128, width: 128 })
                .toString() + '&mode=admin'
        );
    }

    async function fileDeleted(event: CustomEvent<Models.File>) {
        showDelete = false;
        uploader.removeFile(event.detail);
        await invalidate(Dependencies.FILES);
    }

    async function deleteFile(file: Models.File) {
        try {
            await sdk.forProject(page.params.region, page.params.project).storage.deleteFile({ bucketId: file.bucketId, fileId: file.$id });
            await invalidate(Dependencies.FILES);
            await uploader.removeFile(file);
            trackEvent(Submit.FileDelete);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.FileDelete);
        }
    }

    function beforeunload(event: BeforeUnloadEvent) {
        if (uploader.uploading) {
            event.preventDefault();
            event.returnValue = '';
        }
    }

    onMount(() => uploader.setBucket(bucketId));
</script>

<svelte:window on:beforeunload={beforeunload} />

<Layout.Stack direction="row" justifyContent="space-between">
    <Layout.Stack direction="row" alignItems="center">
        <SearchQuery placeholder="Search files" />
    </Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
        <Button secondary href="create" event="create_file" size="s">
            <Icon icon={IconPlus} slot="start" size="s" />
            Upload
        </Button>
    </Layout.Stack>
</Layout.Stack>

{#if files.total}
    <Table.Root columns={7} let:root>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell {root}>Name</Table.Header.Cell>
            <Table.Header.Cell {root}>Type</Table.Header.Cell>
            <Table.Header.Cell {root}>Size</Table.Header.Cell>
            <Table.Header.Cell {root}>Created</Table.Header.Cell>
            <Table.Header.Cell {root}>Updated</Table.Header.Cell>
            <Table.Header.Cell {root}></Table.Header.Cell>
        </svelte:fragment>
        {#each files.files as file}
            {#if uploader.uploading && file.$id === uploader.file?.$id}
                <Table.Row.Base {root}>
                    <Table.Cell column="filename" {root}>
                        <div class="u-flex u-gap-12 u-cross-center">
                            <Avatar size="s" src={getPreview(file.$id)} alt={file.name} />
                            <span class="text u-trim">{file.name}</span>
                        </div>
                    </Table.Cell>
                    <Table.Cell column="mimeType" {root}>
                        <Badge size="s" variant="secondary">{file.mimeType}</Badge>
                    </Table.Cell>
                    <Table.Cell column="sizeOriginal" {root}>
                        {calculateSize(file.sizeOriginal)}
                    </Table.Cell>
                    <Table.Cell column="$createdAt" {root}>
                        <DualTimeView time={file.$createdAt} />
                    </Table.Cell>
                    <Table.Cell column="$updatedAt" {root}>
                        <DualTimeView time={file.$updatedAt} />
                    </Table.Cell>
                    <Table.Cell {root}>
                        <!-- uploading state -->
                    </Table.Cell>
                </Table.Row.Base>
            {:else}
                {@const href = createFileUrl ? createFileUrl(file) : null}
                {#if href}
                    <Table.Row.Link {href} {root}>
                        <Table.Cell column="filename" {root}>
                            <div class="u-flex u-gap-12 u-cross-center">
                                <Avatar size="s" src={getPreview(file.$id)} alt={file.name} />
                                <span class="text u-trim">{file.name}</span>
                            </div>
                        </Table.Cell>
                        <Table.Cell column="mimeType" {root}>
                            <Badge size="s" variant="secondary">{file.mimeType}</Badge>
                        </Table.Cell>
                        <Table.Cell column="sizeOriginal" {root}>
                            {calculateSize(file.sizeOriginal)}
                        </Table.Cell>
                        <Table.Cell column="$createdAt" {root}>
                            <DualTimeView time={file.$createdAt} />
                        </Table.Cell>
                        <Table.Cell column="$updatedAt" {root}>
                            <DualTimeView time={file.$updatedAt} />
                        </Table.Cell>
                        <Table.Cell {root}>
                            <Popover>
                                <Button icon size="s" variant="ghost">
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <svelte:fragment slot="content" let:close>
                                    <ActionMenu.Root>
                                        <ActionMenu.Item.Button icon={IconPencil} on:click={() => { close(); goto(href); }}>
                                            Edit
                                        </ActionMenu.Item.Button>
                                        <ActionMenu.Item.Button icon={IconTrash} on:click={() => { close(); selectedFile = file; showDelete = true; }}>
                                            Delete
                                        </ActionMenu.Item.Button>
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Popover>
                        </Table.Cell>
                    </Table.Row.Link>
                {:else}
                    <Table.Row.Base {root}>
                        <Table.Cell column="filename" {root}>
                            <div class="u-flex u-gap-12 u-cross-center">
                                <Avatar size="s" src={getPreview(file.$id)} alt={file.name} />
                                <span class="text u-trim">{file.name}</span>
                            </div>
                        </Table.Cell>
                        <Table.Cell column="mimeType" {root}>
                            <Badge size="s" variant="secondary">{file.mimeType}</Badge>
                        </Table.Cell>
                        <Table.Cell column="sizeOriginal" {root}>
                            {calculateSize(file.sizeOriginal)}
                        </Table.Cell>
                        <Table.Cell column="$createdAt" {root}>
                            <DualTimeView time={file.$createdAt} />
                        </Table.Cell>
                        <Table.Cell column="$updatedAt" {root}>
                            <DualTimeView time={file.$updatedAt} />
                        </Table.Cell>
                        <Table.Cell {root}>
                            <Popover>
                                <Button icon size="s" variant="ghost">
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <svelte:fragment slot="content" let:close>
                                    <ActionMenu.Root>
                                        <ActionMenu.Item.Button icon={IconTrash} on:click={() => { close(); selectedFile = file; showDelete = true; }}>
                                            Delete
                                        </ActionMenu.Item.Button>
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Popover>
                        </Table.Cell>
                    </Table.Row.Base>
                {/if}
            {/if}
        {/each}
    </Table.Root>

    <PaginationWithLimit name="Files" {limit} {offset} total={files.total} />
{:else if search}
    <EmptySearch target="files" hidePagination>
        <Button size="s" secondary href={clearSearchHref}>Clear Search</Button>
    </EmptySearch>
{:else}
    <Empty single target="file" href="https://appwrite.io/docs/products/storage/upload-download" on:click={() => goto("create")} />
{/if}

{#if selectedFile}
    <DeleteFile file={selectedFile} bind:showDelete on:deleted={fileDeleted} />
{/if}