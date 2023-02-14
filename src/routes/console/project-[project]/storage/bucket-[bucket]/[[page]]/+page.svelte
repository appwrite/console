<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        Pagination,
        Avatar,
        DropList,
        DropListItem,
        DropListLink,
        SearchQuery
    } from '$lib/components';
    import Create from '../create.svelte';
    import Delete from '../deleteFile.svelte';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRowLink,
        TableRow,
        TableCellHead,
        TableCellText,
        TableCell
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@aw-labs/appwrite-console';
    import { uploader } from '$lib/stores/uploader';
    import { addNotification } from '$lib/stores/notifications';
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { Dependencies, PAGE_LIMIT } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let data: PageData;

    let showCreate = false;
    let showDelete = false;
    let showDropdown = [];
    let selectedFile: Models.File = null;

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
    const getPreview = (fileId: string) =>
        sdkForProject.storage.getFilePreview(bucketId, fileId, 32, 32).toString() + '&mode=admin';

    function fileCreated() {
        showCreate = false;
        invalidate(Dependencies.FILES);
    }

    function fileDeleted(event: CustomEvent<Models.File>) {
        showDelete = false;
        uploader.removeFile(event.detail);
        invalidate(Dependencies.FILES);
    }

    async function deleteFile(file: Models.File) {
        try {
            await sdkForProject.storage.deleteFile(file.bucketId, file.$id);
            uploader.removeFile(file);
            invalidate(Dependencies.FILES);
            trackEvent(Submit.FileDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FileDelete);
        }
    }
</script>

<Container>
    <SearchQuery search={data.search} placeholder="Search by filename">
        <Button on:click={() => (showCreate = true)} event="create_file">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create file</span>
        </Button>
    </SearchQuery>

    {#if data.files.total}
        <Table>
            <TableHeader>
                <TableCellHead>Filename</TableCellHead>
                <TableCellHead onlyDesktop width={140}>Type</TableCellHead>
                <TableCellHead onlyDesktop width={100}>Size</TableCellHead>
                <TableCellHead onlyDesktop width={120}>Created</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each data.files.files as file, index}
                    {#if file.chunksTotal / file.chunksUploaded !== 1}
                        <TableRow>
                            <TableCell title="Name">
                                <div class="u-flex u-gap-12 u-main-space-between">
                                    <span class="avatar is-size-small is-color-empty" />

                                    <span class="text u-trim">{file.name}</span>
                                    <div>
                                        <Pill warning>Pending</Pill>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCellText onlyDesktop title="Type">{file.mimeType}</TableCellText>
                            <TableCellText onlyDesktop title="Size">
                                {calculateSize(file.sizeOriginal)}
                            </TableCellText>
                            <TableCellText onlyDesktop title="Date Created">
                                {toLocaleDate(file.$createdAt)}
                            </TableCellText>
                            <TableCell>
                                <div class="u-flex u-main-center">
                                    <button
                                        class="button is-only-icon is-text"
                                        aria-label="Delete item"
                                        on:click|preventDefault>
                                        <span class="icon-refresh" aria-hidden="true" />
                                    </button>
                                    <button
                                        class="button is-only-icon is-text"
                                        aria-label="Delete item"
                                        on:click|preventDefault={() => {
                                            deleteFile(file);
                                        }}>
                                        <span class="icon-trash" aria-hidden="true" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    {:else}
                        <TableRowLink
                            href={`${base}/console/project-${projectId}/storage/bucket-${bucketId}/file-${file.$id}`}>
                            <TableCell title="Name">
                                <div class="u-flex u-gap-12">
                                    <Avatar size={32} src={getPreview(file.$id)} name={file.name} />
                                    <span class="text u-trim">{file.name}</span>
                                </div>
                            </TableCell>
                            <TableCellText onlyDesktop title="Type">{file.mimeType}</TableCellText>
                            <TableCellText onlyDesktop title="Size">
                                {calculateSize(file.sizeOriginal)}
                            </TableCellText>
                            <TableCellText onlyDesktop title="Date Created">
                                {toLocaleDate(file.$createdAt)}
                            </TableCellText>
                            <TableCell showOverflow>
                                <DropList
                                    bind:show={showDropdown[index]}
                                    placement="bottom-start"
                                    noArrow>
                                    <button
                                        class="button is-only-icon is-text"
                                        aria-label="More options"
                                        on:click|preventDefault={() => {
                                            showDropdown[index] = !showDropdown[index];
                                        }}>
                                        <span class="icon-dots-horizontal" aria-hidden="true" />
                                    </button>
                                    <svelte:fragment slot="list">
                                        <DropListLink
                                            on:click={() => {
                                                showDropdown[index] = false;
                                            }}
                                            href={`${base}/console/project-${projectId}/storage/bucket-${bucketId}/file-${file.$id}`}
                                            icon="pencil">Update</DropListLink>
                                        <DropListItem
                                            icon="trash"
                                            on:click={() => {
                                                showDropdown[index] = false;
                                                selectedFile = file;
                                                showDelete = true;
                                            }}>Delete</DropListItem>
                                    </svelte:fragment>
                                </DropList>
                            </TableCell>
                        </TableRowLink>
                    {/if}
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.files.total}</p>
            <Pagination
                limit={PAGE_LIMIT}
                path={`/console/project-${$page.params.project}/storage/bucket-${$page.params.bucket}`}
                offset={data.offset}
                sum={data.files.total} />
        </div>
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn’t find ‘{data.search}’</b>
                <p>There are no files that match your search.</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button external href="https://appwrite.io/docs/storage#createFile" text>
                    Documentation
                </Button>
                <Button
                    secondary
                    href={`/console/project-${$page.params.project}/storage/bucket-${$page.params.bucket}`}>
                    Clear Search
                </Button>
            </div>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/storage#createFile"
            target="file"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate on:created={fileCreated} />
{#if selectedFile}
    <Delete file={selectedFile} bind:showDelete on:deleted={fileDeleted} />
{/if}
