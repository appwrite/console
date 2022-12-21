<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import {
        Avatar,
        DropList,
        DropListItem,
        DropListLink,
        Empty,
        EmptySearch,
        Pagination,
        SearchQuery
    } from '$lib/components';
    import { Dependencies, PAGE_LIMIT } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { uploader } from '$lib/stores/uploader';
    import { wizard } from '$lib/stores/wizard';
    import type { Models } from '@aw-labs/appwrite-console';

    import CreateFile from '../createFile/createFile.svelte';
    import Delete from '../deleteFile.svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    let showDelete = false;
    let showDropdown = [];
    let selectedFile: Models.File = null;

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
    const getPreview = (fileId: string) =>
        sdkForProject.storage.getFilePreview(bucketId, fileId, 32, 32).toString() + '&mode=admin';

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
            trackEvent('submit_file_delete');
            addNotification({
                type: 'success',
                message: `${file.name} has been deleted`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    enum FileStatus {
        PENDING,
        UPLOADING,
        DONE,
    }
    type TableFile = Models.File & { status: FileStatus };
    $: files = [
        ...$uploader.files
            .filter((f) => !f.completed)
            .map((file) => ({
                ...file,
                status: FileStatus.UPLOADING,
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                mimeType: '',
                $permissions: [],
                sizeOriginal: file.size,
                signature: '',
                chunksTotal: 1,
                chunksUploaded: 0
            })),
        ...data.files.files.map((file) => ({
            ...file,
            status: file.chunksTotal / file.chunksUploaded !== 1 ? FileStatus.PENDING : FileStatus.DONE
        }))
    ] satisfies TableFile[];
</script>

<Container>
    <SearchQuery search={data.search} placeholder="Search by filename">
        <Button on:click={() => wizard.start(CreateFile)} event="create_file">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create file</span>
        </Button>
    </SearchQuery>

    {#if data.files.total}
        <Table>
            <TableHeader>
                <TableCellHead>Filename</TableCellHead>
                <TableCellHead width={140}>Type</TableCellHead>
                <TableCellHead width={100}>Size</TableCellHead>
                <TableCellHead width={120}>Created</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each files as file, index}
                    {@const href = `${base}/projects/${projectId}/buckets/${bucketId}/files/${file.$id}`}
                    <TableRow href={file.status === FileStatus.PENDING ? undefined : href}>
                        <TableCell title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                {#if file.status !== FileStatus.DONE}
                                    <span class="avatar is-size-small is-color-empty" />
                                {:else}
                                    <Avatar size={32} src={getPreview(file.$id)} name={file.name} />
                                {/if}
                                <span class="text u-trim"> {file.name}</span>
                                {#if file.status !== FileStatus.DONE}
                                    <Pill warning>Pending</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Type">{file.mimeType}</TableCellText>
                        <TableCellText title="Size">
                            {calculateSize(file.sizeOriginal)}
                        </TableCellText>
                        <TableCellText title="Date Created">
                            {toLocaleDate(file.$createdAt)}
                        </TableCellText>
                        {#if file.status === FileStatus.PENDING}
                            <TableCell>
                                <div class="u-flex u-main-center">
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
                        {:else if file.status === FileStatus.DONE}
                            <TableCell showOverflow>
                                <div class="u-flex u-main-center">
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
                                </div>
                            </TableCell>
                        {/if}
                    </TableRow>
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
            on:click={() => wizard.start(CreateFile)} />
    {/if}
</Container>

{#if selectedFile}
    <Delete file={selectedFile} bind:showDelete on:deleted={fileDeleted} />
{/if}
