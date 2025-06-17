<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Avatar, Empty, EmptySearch, PaginationWithLimit, SearchQuery } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { addNotification } from '$lib/stores/notifications';
    import { uploader } from '$lib/stores/uploader';
    import { sdk } from '$lib/stores/sdk.js';
    import DeleteFile from './deleteFile.svelte';
    import { Layout, Table, Icon, Popover, ActionMenu } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import {
        IconDotsHorizontal,
        IconPencil,
        IconPlus,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;

    let showDelete = false;
    let selectedFile: Models.File = null;

    const bucketId = page.params.bucket;

    function getPreview(fileId: string) {
        return (
            sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFilePreview(bucketId, fileId, 128, 128)
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
            await sdk
                .forProject(page.params.region, page.params.project)
                .storage.deleteFile(file.bucketId, file.$id);
            await invalidate(Dependencies.FILES);
            await uploader.removeFile(file);
            trackEvent(Submit.FileDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FileDelete);
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
                href={getProjectRoute(`/storage/bucket-${page.params.bucket}/create`)}
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
            columns={[
                { id: 'filename' },
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
                    <Table.Row.Base {root}>
                        <Table.Cell column="filename" {root}>
                            <Layout.Stack direction="row" alignItems="center">
                                <span class="avatar is-size-small is-color-empty"></span>
                                <span class="text u-trim">{file.name}</span>
                                <div>
                                    <Pill warning>Pending</Pill>
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
                    {@const href = getProjectRoute(`/storage/bucket-${bucketId}/file-${file.$id}`)}
                    <Table.Row.Link {href} {root}>
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
                                <Button text icon ariaLabel="more options" on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <ActionMenu.Root slot="tooltip">
                                    <ActionMenu.Item.Anchor {href} leadingIcon={IconPencil}>
                                        Update
                                    </ActionMenu.Item.Anchor>
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconTrash}
                                        on:click={() => {
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
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no files that match your search.</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button
                    external
                    href="https://appwrite.io/docs/products/storage/upload-download"
                    text>
                    Documentation
                </Button>
                <Button secondary href={getProjectRoute(`/storage/bucket-${page.params.bucket}`)}>
                    Clear Search
                </Button>
            </div>
        </EmptySearch>
    {:else}
        <Empty
            single
            target="file"
            href="https://appwrite.io/docs/products/storage/upload-download"
            on:click={() =>
                goto(getProjectRoute(`/storage/bucket-${page.params.bucket}/create`))} />
    {/if}
</Container>

{#if selectedFile}
    <DeleteFile file={selectedFile} bind:showDelete on:deleted={fileDeleted} />
{/if}
