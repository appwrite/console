<script lang="ts" context="module">
    export const showCreateFile = () => {
        wizard.start(Create);
    };
</script>

<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        Avatar,
        DropList,
        DropListItem,
        DropListLink,
        Empty,
        EmptySearch,
        PaginationWithLimit,
        SearchQuery
    } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableRowLink
    } from '$lib/elements/table';
    import { toLocaleDate } from '$lib/helpers/date';
    import {
        bytesToSize,
        calculateSize,
        humanFileSize,
        sizeToBytes
    } from '$lib/helpers/sizeConvertion';
    import { Container, ContainerHeader } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { addNotification } from '$lib/stores/notifications';
    import { uploader } from '$lib/stores/uploader';
    import { wizard } from '$lib/stores/wizard';
    import { tooltip } from '$lib/actions/tooltip';
    import { getServiceLimit, showUsageRatesModal, tierToPlan } from '$lib/stores/billing';
    import { sdk } from '$lib/stores/sdk.js';
    import Create from './create-file/create.svelte';
    import DeleteFile from './deleteFile.svelte';
    import { isCloud } from '$lib/system';
    import { onMount } from 'svelte';

    export let data;

    let showDelete = false;
    let showDropdown = [];
    let selectedFile: Models.File = null;

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
    const usedStorage =
        isCloud && data?.organizationUsage?.storageTotal
            ? bytesToSize(data.organizationUsage.storageTotal, 'GB')
            : null;
    const getPreview = (fileId: string) =>
        sdk
            .forProject($page.params.region, $page.params.project)
            .storage.getFilePreview(bucketId, fileId, 64, 64)
            .toString() + '&mode=admin';

    async function fileDeleted(event: CustomEvent<Models.File>) {
        showDelete = false;
        uploader.removeFile(event.detail);
        await invalidate(Dependencies.FILES);
    }

    async function deleteFile(file: Models.File) {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .storage.deleteFile(file.bucketId, file.$id);
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

    $: maxFileSize = isCloud
        ? humanFileSize(sizeToBytes(getServiceLimit('fileSize'), 'MB', 1000))
        : null;

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
                (file) => !file.completed && file.progress < 100 && !file.failed
            );
        });
    });
</script>

<svelte:window on:beforeunload={beforeunload} />

<Container>
    <ContainerHeader title="Files" serviceId="storage" isFlex={false} total={usedStorage}>
        <svelte:fragment let:isButtonDisabled>
            <SearchQuery search={data.search} placeholder="Search by filename">
                <div
                    use:tooltip={{
                        content: `Upgrade to add more files`,
                        disabled: !isButtonDisabled
                    }}>
                    <Button
                        on:click={() => wizard.start(Create)}
                        event="create_file"
                        disabled={isButtonDisabled}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create file</span>
                    </Button>
                </div>
            </SearchQuery>
        </svelte:fragment>
        <svelte:fragment slot="tooltip" let:limit let:tier let:upgradeMethod>
            {#if tier === tierToPlan(BillingPlan.FREE).name}
                <p class="u-bold">The {tier} plan has limits</p>
                <ul>
                    <li>{limit}GB total file storage</li>
                    <li>
                        {Math.floor(parseInt(maxFileSize.value))}{maxFileSize.unit} file upload size
                        limit
                    </li>
                </ul>
                <p class="text">
                    <button class="link" type="button" on:click|preventDefault={upgradeMethod}
                        >Upgrade</button>
                    for additional storage resources.
                </p>
            {:else}
                <p class="text">
                    You are limited to {limit} GB storage on the {tier} plan. After this amount
                    <button
                        class="link"
                        type="button"
                        on:click|preventDefault={() => ($showUsageRatesModal = true)}
                        >usage fees will apply</button>
                    .
                </p>
            {/if}
        </svelte:fragment>
    </ContainerHeader>

    {#if data.files.total}
        <Table>
            <TableHeader>
                <TableCellHead>Filename</TableCellHead>
                <TableCellHead onlyDesktop width={140}>Type</TableCellHead>
                <TableCellHead onlyDesktop width={100}>Size</TableCellHead>
                <TableCellHead onlyDesktop width={120}>Created</TableCellHead>
                <TableCellHead width={40} />
            </TableHeader>
            <TableBody>
                {#each data.files.files as file, index}
                    {#if file.chunksTotal / file.chunksUploaded !== 1}
                        <TableRow>
                            <TableCell title="Name">
                                <div class="u-flex u-gap-12 u-cross-center">
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
                            href={`${base}/project-${$page.params.region}-${projectId}/storage/bucket-${bucketId}/file-${file.$id}`}>
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
                                            href={`${base}/project-${$page.params.region}-${projectId}/storage/bucket-${bucketId}/file-${file.$id}`}
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
                <Button
                    secondary
                    href={`${base}/project-${$page.params.region}-${$page.params.project}/storage/bucket-${$page.params.bucket}`}>
                    Clear Search
                </Button>
            </div>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/storage/upload-download"
            target="file"
            on:click={() => wizard.start(Create)} />
    {/if}
</Container>

{#if selectedFile}
    <DeleteFile file={selectedFile} bind:showDelete on:deleted={fileDeleted} />
{/if}
