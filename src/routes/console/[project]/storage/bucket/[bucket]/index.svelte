<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination } from '$lib/components';
    import type { Models } from 'src/sdk';
    import Create from './_create.svelte';
    import Update from './_update.svelte';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCellText
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';

    let search = '';
    let showCreate = false;
    let showUpdate = false;
    let offset = 0;
    let currentFile: Models.File;

    const limit = 25;
    const bucket = $page.params.bucket;
    const openFile = (file: Models.File) => {
        currentFile = file;
        showUpdate = true;
    };
    const getPreview = (fileId: string) =>
        sdkForProject.storage.getFilePreview(bucket, fileId, 30, 30).toString() + '&mode=admin';

    $: request = sdkForProject.storage.listFiles(bucket, search, limit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <div class="input-text-wrapper u-flex-basis-50-percent">
            <input
                type="search"
                placeholder="Search by Filename"
                class="input-text"
                bind:value={search} />
            <span class="icon-search" aria-hidden="true" />
        </div>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Add File</span>
        </Button>
    </div>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Table>
                <TableHeader>
                    <TableCellHead>Filename</TableCellHead>
                    <TableCellHead>Type</TableCellHead>
                    <TableCellHead>Size</TableCellHead>
                    <TableCellHead>Date Created</TableCellHead>
                    <TableCellHead width={30} />
                </TableHeader>
                <TableBody>
                    {#each response.files as file}
                        <TableRow>
                            <TableCellText title="Name">
                                <div class="u-flex u-gap-12">
                                    <span class="link" on:click={() => openFile(file)}>
                                        <img
                                            class="avatar"
                                            width="40"
                                            height="40"
                                            src={getPreview(file.$id)}
                                            alt={file.name} />
                                        {file.name}
                                    </span>
                                </div>
                            </TableCellText>
                            <TableCellText title="Type">{file.mimeType}</TableCellText>
                            <TableCellText title="Size">{file.sizeOriginal}</TableCellText>
                            <TableCellText title="Date Created"
                                >{toLocaleDate(file.dateCreated)}</TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {response.total}</p>
                <Pagination {limit} bind:offset sum={response.total} />
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
            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {response.total}</p>
                <Pagination {limit} bind:offset sum={response.total} />
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
    {/await}
</Container>

<Create bind:showCreate />
<Update bind:showUpdate bind:file={currentFile} />
