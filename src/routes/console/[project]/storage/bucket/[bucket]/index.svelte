<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { Card, Empty, Pagination } from '$lib/components';
    import type { Models } from 'src/sdk';
    import Create from './_create.svelte';
    import Update from './_update.svelte';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCellText,
        TableCellAvatar
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
    <h1>Files</h1>
    <Card>
        <InputSearch bind:value={search} />
    </Card>

    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Table>
                <TableHeader>
                    <TableCellHead width={30} />
                    <TableCellHead>Name</TableCellHead>
                    <TableCellHead>Type</TableCellHead>
                    <TableCellHead>Size</TableCellHead>
                    <TableCellHead>Date Created</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each response.files as file}
                        <TableRow>
                            <TableCellAvatar
                                src={getPreview(file.$id)}
                                alt={file.name}
                                onlyDesktop />
                            <TableCellText title="Name">
                                <span class="link" on:click={() => openFile(file)}>
                                    {file.name}
                                </span>
                            </TableCellText>
                            <TableCellText title="Type">{file.mimeType}</TableCellText>
                            <TableCellText title="Size">{file.sizeOriginal}</TableCellText>
                            <TableCellText title="Date Created"
                                >{toLocaleDate(file.dateCreated)}</TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>

            <Pagination {limit} bind:offset sum={response.total} />
        {:else if search}
            <Empty>
                <svelte:fragment slot="header"
                    >No results found for <b>{search}</b></svelte:fragment>
            </Empty>
        {:else}
            <Empty>
                <svelte:fragment slot="header">No Files Found</svelte:fragment>
                Upload your first file to get started.
            </Empty>
        {/if}
    {/await}

    <Button on:click={() => (showCreate = true)}>Upload</Button>
</Container>

<Create bind:showCreate />
<Update bind:showUpdate bind:file={currentFile} />
