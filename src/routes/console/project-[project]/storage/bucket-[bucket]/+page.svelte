<script lang="ts" context="module">
    let showCreate = writable(false);

    export const showCreateFile = () => {
        showCreate.set(true);
    };
</script>

<script lang="ts">
    import { page } from '$app/stores';
    import { sdk } from '$lib/stores/sdk';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        Avatar,
        DropList,
        DropListItem,
        DropListLink,
        SearchQuery,
        PaginationWithLimit,
        Alert
    } from '$lib/components';
    import Create from './create.svelte';
    import Delete from './deleteFile.svelte';
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
    import { Container, ContainerHeader } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import { uploader } from '$lib/stores/uploader';
    import { addNotification } from '$lib/stores/notifications';
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { tooltip } from '$lib/actions/tooltip';
    import { readOnly } from '$lib/stores/billing';
    import { writable } from 'svelte/store';

    export let data: PageData;

    let showDelete = false;
    let showDropdown = [];
    let selectedFile: Models.File = null;

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
    const usedStorage = data.oraganizationUsage.storage;
    const getPreview = (fileId: string) =>
        sdk.forProject.storage.getFilePreview(bucketId, fileId, 32, 32).toString() + '&mode=admin';

    async function fileCreated() {
        $showCreate = false;
        await invalidate(Dependencies.FILES);
    }

    async function fileDeleted(event: CustomEvent<Models.File>) {
        showDelete = false;
        uploader.removeFile(event.detail);
        await invalidate(Dependencies.FILES);
    }

    async function deleteFile(file: Models.File) {
        try {
            await sdk.forProject.storage.deleteFile(file.bucketId, file.$id);
            await invalidate(Dependencies.FILES);
            uploader.removeFile(file);
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
    <ContainerHeader
        title="Files"
        serviceId="storage"
        isFlex={false}
        total={usedStorage}
        buttonDisabled={$readOnly.storage}>
        <svelte:fragment slot="alert" let:tier let:upgradeMethod>
            <Alert type="warning">
                <span class="text">
                    You've reached the storage limit for the {tier} plan.
                    <button class="link" type="button" on:click|preventDefault={upgradeMethod}
                        >Upgrade</button>
                    for additional storage.
                </span>
            </Alert>
        </svelte:fragment>
        <svelte:fragment let:isButtonDisabled>
            <SearchQuery search={data.search} placeholder="Search by filename">
                <div
                    use:tooltip={{
                        content: `Upgrade to add more files`,
                        disabled: !isButtonDisabled
                    }}>
                    <Button
                        on:click={() => ($showCreate = true)}
                        event="create_file"
                        disabled={isButtonDisabled}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create file</span>
                    </Button>
                </div>
            </SearchQuery>
        </svelte:fragment>
        <svelte:fragment slot="tooltip" let:limit let:tier let:upgradeMethod>
            <p class="text">
                You are limited to {limit} GB of storage on the {tier} plan.

                <button class="link" type="button" on:click|preventDefault={upgradeMethod}
                    >Upgrade</button>
                for addtional storage.
            </p>
        </svelte:fragment>
    </ContainerHeader>

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
                                <div class="u-flex u-gap-12 u-main-space-between u-cross-center">
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
                                <div class="u-flex u-gap-12 u-cross-center">
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

        <PaginationWithLimit
            name="Files"
            limit={data.limit}
            offset={data.offset}
            total={data.files.total} />
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find ‘{data.search}'</b>
                <p>There are no files that match your search.</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button
                    external
                    href="https://appwrite.io/docs/products/storage/upload-download"
                    text>
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
            href="https://appwrite.io/docs/products/storage/upload-download"
            target="file"
            on:click={() => ($showCreate = true)} />
    {/if}
</Container>

<Create bind:showCreate={$showCreate} on:created={fileCreated} />
{#if selectedFile}
    <Delete file={selectedFile} bind:showDelete on:deleted={fileDeleted} />
{/if}
