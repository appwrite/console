<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        Pagination,
        Avatar,
        Search,
        DropList,
        DropListItem,
        DropListLink
    } from '$lib/components';
    import Create from './_create.svelte';
    import Delete from './_deleteFile.svelte';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCellText
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { bytesToSize } from '$lib/helpers/sizeConvertion';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { files } from './store';
    import type { Models } from '@aw-labs/appwrite-console';

    let search = '';
    let showCreate = false;
    let showDropdown = [];
    let showDelete = false;
    let selectedFile: Models.File = null;
    let offset = 0;

    const limit = 5;
    const project = $page.params.project;
    const bucket = $page.params.bucket;

    const getPreview = (fileId: string) =>
        sdkForProject.storage.getFilePreview(bucket, fileId, 32, 32).toString() + '&mode=admin';

    const fileCreated = () => {
        showCreate = false;
        files.load(bucket, search, limit, offset);
    };

    $: files.load(bucket, search, limit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <Search bind:search placeholder="Search by Filename">
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
                    <TableRowLink
                        href={`${base}/console/${project}/storage/bucket/${bucket}/file/${file.$id}`}>
                        <TableCellText title="Name">
                            <div class="u-flex u-gap-12">
                                <Avatar size={32} src={getPreview(file.$id)} name={file.name} />
                                <span> {file.name}</span>
                            </div>
                        </TableCellText>
                        <TableCellText title="Type">{file.mimeType}</TableCellText>
                        <TableCellText title="Size">{bytesToSize(file.sizeOriginal)}</TableCellText>
                        <TableCellText title="Date Created"
                            >{toLocaleDate(file.$createdAt)}</TableCellText>
                        <TableCellText showOverflow title="">
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
                                    <DropListLink
                                        icon="pencil"
                                        href={`${base}/console/${project}/storage/bucket/${bucket}/file/${file.$id}`}
                                        >Update</DropListLink>
                                    <DropListItem
                                        icon="trash"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedFile = file;
                                            showDelete = true;
                                        }}>Delete</DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$files.total}</p>
            <Pagination {limit} bind:offset sum={$files.total} />
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
            <Pagination {limit} bind:offset sum={$files?.total} />
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
    <Delete file={selectedFile} bind:showDelete />
{/if}
