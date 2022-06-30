<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Avatar, Search } from '$lib/components';
    import Create from './_create.svelte';
    import Delete from './_deleteFile.svelte';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCellText,
        TableCellLink
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { bytesToSize } from '$lib/helpers/sizeConvertion';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { files } from './store';
    import type { Models } from 'src/sdk';

    let search = '';
    let showCreate = false;
    let showDropdown = false;
    let showDelete = false;
    let selectedFile: Models.File = null;
    let offset = 0;

    const limit = 5;
    const project = $page.params.project;
    const bucket = $page.params.bucket;

    const getPreview = (fileId: string) =>
        sdkForProject.storage.getFilePreview(bucket, fileId, 40, 40).toString() + '&mode=admin';

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
    {#if $files?.response?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Filename</TableCellHead>
                <TableCellHead>Type</TableCellHead>
                <TableCellHead>Size</TableCellHead>
                <TableCellHead>Date Created</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $files.response.files as file}
                    <TableRow>
                        <TableCellLink
                            title="Name"
                            href={`${base}/console/${project}/storage/bucket/${bucket}/file/${file.$id}`}>
                            <div class="u-flex u-gap-12">
                                <Avatar size={40} src={getPreview(file.$id)} name={file.name} />
                                <span> {file.name}</span>
                            </div>
                        </TableCellLink>
                        <TableCellText title="Type">{file.mimeType}</TableCellText>
                        <TableCellText title="Size">{bytesToSize(file.sizeOriginal)}</TableCellText>
                        <TableCellText title="Date Created"
                            >{toLocaleDate(file.dateCreated)}</TableCellText>
                        <TableCellText title="">
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                on:click={() => {
                                    showDropdown = !showDropdown;
                                }}>
                                <span class="icon-dots-horizontal" aria-hidden="true" />
                            </button>
                        </TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$files.response.total}</p>
            <Pagination {limit} bind:offset sum={$files.response.total} />
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
            <p class="text">Total results: {$files.response?.total}</p>
            <Pagination {limit} bind:offset sum={$files.response?.total} />
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
