<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Avatar, Search, DropList, DropListItem } from '$lib/components';
    import Create from './_create.svelte';
    import Delete from './_deleteFile.svelte';
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
    import { files } from './store';
    import type { Models } from '@aw-labs/appwrite-console';
    import { uploader } from '$lib/stores/uploader';
    import { addNotification } from '$lib/stores/notifications';
    import { goto } from '$app/navigation';
    import { pageLimit } from '$lib/stores/layout';

    let search = '';
    let showCreate = false;
    let showDropdown = [];
    let showDelete = false;
    let selectedFile: Models.File = null;
    let offset = 0;

    const project = $page.params.project;
    const bucket = $page.params.bucket;

    const getPreview = (fileId: string) =>
        sdkForProject.storage.getFilePreview(bucket, fileId, 32, 32).toString() + '&mode=admin';

    const fileCreated = () => {
        showCreate = false;
        files.load(bucket, search, $pageLimit, offset);
    };

    const fileDeleted = (event: CustomEvent<Models.File>) => {
        showDelete = false;
        uploader.removeFile(event.detail);
        files.load(bucket, search, $pageLimit, offset);
    };

    const deleteFile = async (file: Models.File) => {
        try {
            await sdkForProject.storage.deleteFile(file.bucketId, file.$id);
            uploader.removeFile(file);
            files.load(bucket, search, $pageLimit, offset);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    $: files.load(bucket, search, $pageLimit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <Search bind:search placeholder="Search by filename">
        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Add File</span>
        </Button>
    </Search>
    {#if $files?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Filename</TableCellHead>
                <TableCellHead>Type</TableCellHead>
                <TableCellHead>Size</TableCellHead>
                <TableCellHead>Date Created</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $files.files as file, index}
                    {#if file.chunksTotal / file.chunksUploaded !== 1}
                        <TableRow>
                            <TableCell title="Name">
                                <div class="u-flex u-gap-12">
                                    <div class="avatar is-color-empty" />

                                    <span class="text u-trim"> {file.name}</span>
                                    <Pill warning>Pending</Pill>
                                </div>
                            </TableCell>
                            <TableCellText title="Type">{file.mimeType}</TableCellText>
                            <TableCellText title="Size"
                                >{calculateSize(file.sizeOriginal)}</TableCellText>
                            <TableCellText title="Date Created"
                                >{toLocaleDate(file.$createdAt)}</TableCellText>
                            <TableCell>
                                <div class="u-flex u-main-center">
                                    <button
                                        class="button is-only-icon is-text"
                                        aria-label="Delete item"
                                        on:click|preventDefault={() => {
                                            console.log('Feel refreshed?');
                                        }}>
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
                            href={`${base}/console/project-${project}/storage/bucket/${bucket}/file/${file.$id}`}>
                            <TableCell title="Name">
                                <div class="u-flex u-gap-12">
                                    <Avatar size={32} src={getPreview(file.$id)} name={file.name} />
                                    <span class="text u-trim"> {file.name}</span>
                                </div>
                            </TableCell>
                            <TableCellText title="Type">{file.mimeType}</TableCellText>
                            <TableCellText title="Size"
                                >{calculateSize(file.sizeOriginal)}</TableCellText>
                            <TableCellText title="Date Created"
                                >{toLocaleDate(file.$createdAt)}</TableCellText>
                            <TableCell showOverflow>
                                <DropList
                                    bind:show={showDropdown[index]}
                                    position="bottom"
                                    horizontal="left"
                                    arrow={false}>
                                    <button
                                        class="button is-only-icon is-text"
                                        aria-label="More options"
                                        on:click|preventDefault={() => {
                                            showDropdown[index] = !showDropdown[index];
                                        }}>
                                        <span class="icon-dots-horizontal" aria-hidden="true" />
                                    </button>
                                    <svelte:fragment slot="list">
                                        <DropListItem
                                            icon="pencil"
                                            on:click={(e) => {
                                                e.preventDefault();
                                                goto(
                                                    `${base}/console/project-${project}/storage/bucket/${bucket}/file/${file.$id}`
                                                );
                                            }}>Update</DropListItem>
                                        <DropListItem
                                            icon="trash"
                                            on:click={(e) => {
                                                e.preventDefault();
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
            <p class="text">Total results: {$files.total}</p>
            <Pagination limit={$pageLimit} bind:offset sum={$files.total} />
        </div>
    {:else if search}
        <Empty>
            <div class="u-flex u-flex-vertical">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <div class="common-section">
                    <p>There are no files that match your search.</p>
                </div>
                <div class="common-section">
                    <Button secondary on:click={() => (search = '')}>Clear Search</Button>
                </div>
            </div>
        </Empty>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$files?.total}</p>
            <Pagination limit={$pageLimit} bind:offset sum={$files?.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <i class="icon-plus" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Upload some files to get started</p>
                </div>
                <div class="common-section">
                    <Button secondary href="#">Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={fileCreated} />
{#if selectedFile}
    <Delete file={selectedFile} bind:showDelete on:deleted={fileDeleted} />
{/if}
