<script lang="ts">
    import { EmptySearch, Id } from '.';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { writable } from 'svelte/store';
    import { Button, InputSelect } from '$lib/elements/forms';
    import DualTimeView from './dualTimeView.svelte';
    import type { Models } from '@appwrite.io/console';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import InputSearch from '$lib/elements/forms/inputSearch.svelte';
    import { ID, Query, Permission, Role } from '@appwrite.io/console';
    import {
        ActionMenu,
        Card,
        Divider,
        Empty,
        Layout,
        Modal,
        Selector,
        Spinner,
        Table,
        ToggleButton,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IconViewGrid, IconViewList } from '@appwrite.io/pink-icons-svelte';
    import { showCreateBucket } from '$routes/(console)/project-[project]/storage/+page.svelte';
    import { consoleProfile, isStudio } from '$lib/system';

    export let show: boolean;
    export let mimeTypeQuery: string = 'image/';
    export let allowedExtension: string = '*';
    export let selectedBucket: string = null;
    export let selectedFile: string = null;
    export let onSelect: (e: Models.File) => void;
    export let gridImageDimensions: { imageHeight?: number; imageWidth?: number } = {
        imageHeight: 148
    };

    let search = writable('');
    let searchEnabled = false;
    let fileSelector: HTMLInputElement;
    let uploading = false;
    let view: 'grid' | 'list' = 'list';

    onMount(() => {
        selectedBucket = currentBucket?.$id;
    });

    function onSubmit() {
        onSelect(currentFile);
        closeModal();
    }

    function getPreview(bucketId: string, fileId: string, size: number = 64) {
        return (
            sdk.forProject.storage.getFilePreview(bucketId, fileId, size, size).toString() +
            '&mode=admin'
        );
    }

    async function uploadFile() {
        try {
            uploading = true;
            const file = await sdk.forProject.storage.createFile(
                selectedBucket,
                ID.unique(),
                fileSelector.files[0],
                [Permission.read(Role.any())]
            );
            search.set($search === null ? '' : null);
            selectFile(file);
        } catch (e) {
            console.error(e);
        } finally {
            uploading = false;
        }
    }

    function selectBucket(bucket: Models.Bucket | null) {
        search.set('');
        currentBucket = bucket;
        selectedBucket = bucket?.$id ?? null;
        resetFile();
    }

    function selectFile(file: Models.File) {
        currentFile = file;
        selectedBucket = currentFile.bucketId;
        selectedFile = currentFile.$id;
    }

    function resetFile() {
        selectedFile = null;
    }

    function resetBucket() {
        selectedBucket = null;
    }

    function closeModal() {
        show = false;
        resetFile();
        resetBucket();
    }

    function handleVisibilityChange() {
        if (!document.hidden) {
            buckets = loadBuckets();
        }
    }

    let currentBucket: Models.Bucket = null;
    let currentFile: Models.File = null;
    let buckets: Promise<Models.BucketList> = loadBuckets();

    async function loadBuckets() {
        const response = await sdk.forProject.storage.listBuckets();
        const bucket = response.buckets[0] ?? null;
        if (bucket) {
            currentBucket = bucket;
            selectedBucket = bucket.$id;
        }

        return response;
    }

    function truncatedFilename(file: Models.File, max: number = 15): string {
        const length = file.name.length;
        return length > 15 ? `${file.name.substring(0, max)}...` : file.name;
    }

    function getProperQuery(): string[] {
        let query = [Query.orderDesc('$createdAt')];

        if (allowedExtension === '*') {
            query.push(Query.startsWith('mimeType', mimeTypeQuery));
        } else {
            query.push(Query.endsWith('name', `.${allowedExtension}`));
        }

        return query;
    }

    $: files =
        currentBucket &&
        sdk.forProject.storage
            .listFiles(currentBucket.$id, getProperQuery(), $search || undefined)
            .then((response) => {
                if ($search === '') {
                    searchEnabled = response.total > 0;
                }

                return response;
            });

    $: if ($search) {
        resetFile();
    }

    $: extension = allowedExtension === '*' ? mimeTypeQuery : `.${allowedExtension}`;

    $: console.log(`Allowed extensions: ${allowedExtension}, MimeType: ${mimeTypeQuery}`);
</script>

<svelte:document on:visibilitychange={handleVisibilityChange} />

<Form {onSubmit} isModal class="file-picker-modal-form">
    <Modal bind:open={show} title="Select file" size="l">
        <Layout.Stack direction={$isSmallViewport ? 'column' : 'row'} height="50vh" gap="none">
            <!-- min-width to avoid a layout-shift -->
            <aside>
                {#if !$isSmallViewport}
                    <Typography.Caption variant="500">Buckets</Typography.Caption>
                {/if}

                {#await buckets}
                    {#if $isSmallViewport}
                        <!-- disabled state -->
                        <div style:padding-block-start="1rem">
                            <InputSelect
                                required
                                disabled
                                id="bucket"
                                options={[]}
                                label="Bucket"
                                placeholder="Loading buckets..." />
                        </div>
                    {/if}
                {:then response}
                    {#if $isSmallViewport}
                        <div style:padding-block-start="1rem">
                            <InputSelect
                                required
                                id="bucket"
                                label="Bucket"
                                bind:value={selectedBucket}
                                placeholder="Select bucket"
                                on:change={(event) => {
                                    const bucketId = event.detail;
                                    const bucket = response.buckets.find(
                                        (bucket) => bucket.$id === bucketId
                                    );
                                    selectBucket(bucket);
                                }}
                                options={response.buckets.map((bucket) => {
                                    return {
                                        value: bucket.$id,
                                        label: `${bucket.name}`
                                    };
                                })} />
                        </div>
                    {:else}
                        <div class="action-menu-holder">
                            <ActionMenu.Root width="180px">
                                {#each response.buckets as bucket}
                                    {@const isSelected = bucket.$id === selectedBucket}
                                    <div class="action-button" class:active-item={isSelected}>
                                        <ActionMenu.Item.Button
                                            on:click={() => selectBucket(bucket)}>
                                            {bucket.name}
                                        </ActionMenu.Item.Button>
                                    </div>
                                {:else}
                                    <ActionMenu.Item.Button
                                        >No buckets found</ActionMenu.Item.Button>
                                {/each}
                            </ActionMenu.Root>
                        </div>
                    {/if}
                {/await}
            </aside>

            <div style:padding-inline-start="1rem" style:opacity={$isSmallViewport ? 0 : 1}>
                <Divider vertical />
            </div>

            <div class="files-section">
                <Layout.Stack gap="l">
                    {#if $isSmallViewport}
                        <Button
                            secondary
                            disabled={uploading}
                            on:click={() => fileSelector.click()}>
                            <input
                                type="file"
                                tabindex="-1"
                                class="u-hide"
                                accept={extension}
                                on:change={uploadFile}
                                bind:this={fileSelector} />
                            {#if uploading}
                                <div class="loader is-small"></div>
                                <span>Uploading</span>
                            {:else}
                                <span class="icon-upload" aria-hidden="true"></span>
                                <span>Upload</span>
                            {/if}
                        </Button>
                    {/if}

                    {#await buckets then response}
                        {#if response?.total}
                            {#if currentBucket}
                                <Layout.Stack>
                                    {#if !$isSmallViewport}
                                        {#key currentBucket?.$id}
                                            <Layout.Stack direction="row" alignItems="center">
                                                <Typography.Title size="s"
                                                    >{currentBucket?.name}</Typography.Title>
                                                <Id value={currentBucket?.$id} event="bucket">
                                                    {currentBucket?.$id}
                                                </Id>
                                            </Layout.Stack>
                                        {/key}
                                    {/if}
                                    <Layout.Stack direction="row" alignItems="center">
                                        <InputSearch
                                            placeholder="Search files"
                                            bind:value={$search}
                                            disabled={!searchEnabled} />
                                        <ToggleButton
                                            bind:active={view}
                                            buttons={[
                                                {
                                                    id: 'list',
                                                    label: 'list view',
                                                    disabled: !searchEnabled,
                                                    icon: IconViewList
                                                },
                                                {
                                                    id: 'grid',
                                                    label: 'grid view',
                                                    disabled: !searchEnabled,
                                                    icon: IconViewGrid
                                                }
                                            ]} />
                                        {#if !$isSmallViewport}
                                            <Button
                                                secondary
                                                disabled={uploading}
                                                on:click={() => fileSelector.click()}>
                                                <input
                                                    type="file"
                                                    tabindex="-1"
                                                    class="u-hide"
                                                    accept={extension}
                                                    on:change={uploadFile}
                                                    bind:this={fileSelector} />
                                                {#if uploading}
                                                    <div class="loader is-small"></div>
                                                    <span>Uploading</span>
                                                {:else}
                                                    <span class="icon-upload" aria-hidden="true"
                                                    ></span>
                                                    <span>Upload</span>
                                                {/if}
                                            </Button>
                                        {/if}
                                    </Layout.Stack>
                                </Layout.Stack>

                                {#if files}
                                    {#await files}
                                        <Layout.Stack
                                            justifyContent="center"
                                            alignContent="center"
                                            alignItems="center"
                                            gap="xl"
                                            height="100%">
                                            <Spinner size="l" />
                                            <span>Loading files...</span>
                                        </Layout.Stack>
                                    {:then response}
                                        {#if response?.files?.length}
                                            {#if view === 'grid'}
                                                {#if $isSmallViewport}
                                                    <Layout.Stack gap="l">
                                                        {#each response?.files as file}
                                                            <Card.Selector
                                                                radius="s"
                                                                name="files"
                                                                padding="xxs"
                                                                imageHeight={32}
                                                                imageWidth={32}
                                                                imageRadius="xs"
                                                                bind:group={selectedFile}
                                                                title={truncatedFilename(file, 14)}
                                                                value={file.$id}
                                                                src={getPreview(
                                                                    currentBucket.$id,
                                                                    file.$id,
                                                                    360
                                                                )}
                                                                on:click={() => selectFile(file)} />
                                                        {/each}
                                                    </Layout.Stack>
                                                {:else}
                                                    <Layout.Grid
                                                        columnsXXS={1}
                                                        columnsXS={2}
                                                        columnsS={3}
                                                        columns={4}>
                                                        {#each response?.files as file}
                                                            <div class="image-selector">
                                                                <Card.Selector
                                                                    radius="s"
                                                                    name="files"
                                                                    padding="xxs"
                                                                    imageWidth={gridImageDimensions.imageWidth}
                                                                    imageHeight={gridImageDimensions.imageHeight}
                                                                    imageRadius="xs"
                                                                    bind:group={selectedFile}
                                                                    title={truncatedFilename(
                                                                        file,
                                                                        14
                                                                    )}
                                                                    value={file.$id}
                                                                    src={getPreview(
                                                                        currentBucket.$id,
                                                                        file.$id,
                                                                        360
                                                                    )}
                                                                    on:click={() =>
                                                                        selectFile(file)} />
                                                            </div>
                                                        {/each}
                                                    </Layout.Grid>
                                                {/if}
                                            {/if}
                                            {#if view === 'list'}
                                                <Table.Root
                                                    let:root
                                                    columns={[
                                                        { id: 'filename', width: { min: 225 } },
                                                        { id: 'id', width: { min: 200 } },
                                                        { id: 'type', width: { min: 100 } },
                                                        { id: 'size', width: { min: 120 } },
                                                        { id: 'created', width: { min: 140 } }
                                                    ]}>
                                                    <svelte:fragment slot="header" let:root>
                                                        <Table.Header.Cell column="filename" {root}>
                                                            Filename
                                                        </Table.Header.Cell>
                                                        <Table.Header.Cell column="id" {root}>
                                                            ID
                                                        </Table.Header.Cell>
                                                        <Table.Header.Cell column="type" {root}>
                                                            Type
                                                        </Table.Header.Cell>
                                                        <Table.Header.Cell column="size" {root}>
                                                            Size
                                                        </Table.Header.Cell>
                                                        <Table.Header.Cell column="created" {root}>
                                                            Created
                                                        </Table.Header.Cell>
                                                    </svelte:fragment>
                                                    {#each response?.files as file (file.$id)}
                                                        <Table.Row.Button
                                                            {root}
                                                            on:click={() => selectFile(file)}>
                                                            <Table.Cell column="filename" {root}>
                                                                <div
                                                                    class="u-inline-flex u-cross-center u-gap-12">
                                                                    <Selector.Radio
                                                                        size="s"
                                                                        name="file"
                                                                        value={file.$id}
                                                                        bind:group={selectedFile} />

                                                                    <div class="preview-block">
                                                                        <img
                                                                            alt={file.name}
                                                                            src={getPreview(
                                                                                currentBucket.$id,
                                                                                file.$id
                                                                            )} />
                                                                    </div>

                                                                    <Tooltip
                                                                        disabled={file.name.length <
                                                                            15}
                                                                        maxWidth="fit-content">
                                                                        <Typography.Text truncate>
                                                                            {truncatedFilename(
                                                                                file
                                                                            )}
                                                                        </Typography.Text>

                                                                        <span slot="tooltip">
                                                                            {file.name}
                                                                        </span>
                                                                    </Tooltip>
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell column="id" {root}>
                                                                <Id value={file.$id}>{file.$id}</Id>
                                                            </Table.Cell>
                                                            <Table.Cell column="type" {root}>
                                                                {file.mimeType}
                                                            </Table.Cell>
                                                            <Table.Cell column="size" {root}>
                                                                {calculateSize(file.sizeOriginal)}
                                                            </Table.Cell>
                                                            <Table.Cell column="created" {root}>
                                                                <DualTimeView
                                                                    time={file.$createdAt} />
                                                            </Table.Cell>
                                                        </Table.Row.Button>
                                                    {/each}
                                                </Table.Root>
                                            {/if}
                                        {:else if $search}
                                            <EmptySearch
                                                hidePages
                                                hidePagination
                                                bind:search={$search}
                                                target="files">
                                                <Button secondary on:click={() => ($search = '')}>
                                                    Clear search
                                                </Button>
                                            </EmptySearch>
                                        {:else}
                                            <Card.Base padding="none">
                                                <Empty
                                                    title="No files found within this bucket."
                                                    description={isStudio
                                                        ? ''
                                                        : 'Need a hand? Learn more in our documentation.'}>
                                                    <slot name="actions" slot="actions">
                                                        <Button
                                                            text
                                                            external
                                                            size="s"
                                                            event="empty_documentation"
                                                            href="https://appwrite.io/docs/products/storage/upload-download"
                                                            ariaLabel="create document"
                                                            >Documentation</Button>
                                                        <Button
                                                            secondary
                                                            disabled={uploading}
                                                            on:click={() => fileSelector.click()}
                                                            >Upload file
                                                        </Button>
                                                    </slot>
                                                </Empty>
                                            </Card.Base>
                                        {/if}
                                    {/await}
                                {/if}
                            {/if}
                        {:else}
                            <Card.Base padding="none">
                                <Empty
                                    title="No buckets found"
                                    description={!consoleProfile.hasAppwriteDocumentation
                                        ? ''
                                        : 'Need a hand? Learn more in our documentation.'}>
                                    <slot name="actions" slot="actions">
                                        {#if consoleProfile.hasAppwriteDocumentation}
                                            <Button
                                                text
                                                external
                                                size="s"
                                                event="empty_documentation"
                                                href="https://appwrite.io/docs/products/storage/buckets"
                                                ariaLabel="create document">Documentation</Button>
                                        {/if}
                                        <Button
                                            secondary
                                            on:click={async () => {
                                                await goto(
                                                    `${base}/project-${page.params.project}/storage`
                                                );
                                                $showCreateBucket = true;
                                            }}>
                                            Create bucket
                                        </Button>
                                    </slot>
                                </Empty>
                            </Card.Base>
                        {/if}
                    {/await}
                </Layout.Stack>
            </div>
        </Layout.Stack>
        <svelte:fragment slot="footer">
            <Layout.Stack direction="row" justifyContent="flex-end">
                <Button text on:click={closeModal}>Cancel</Button>
                <Button submit disabled={selectedBucket === null || selectedFile === null}
                    >Select
                </Button>
            </Layout.Stack>
        </svelte:fragment>
    </Modal>
</Form>

<style>
    :global(.file-picker-modal-form dialog .content) {
        overflow: hidden;
        padding: unset !important;

        /* multiple scroll bars from `.content` and `.files-section` look very odd */
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    aside {
        min-width: 200px;
        padding: var(--space-7);

        @media (max-width: 768px) {
            padding-block: unset;
            padding-inline: var(--space-7);
        }
    }

    .files-section {
        width: 100%;
        height: 100%;
        overflow: auto;
        padding: var(--space-8);
        background: var(--bgcolor-neutral-default);

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .action-menu-holder :global(div:first-of-type) {
        padding-inline: unset;
    }

    .action-button {
        width: 100%;
        margin-block: 0.125rem;

        & :global(button) {
            width: 100%;
        }

        &.active-item {
            border-radius: var(--border-radius-s);
            background-color: var(--bgcolor-neutral-secondary, #f4f4f7);
        }
    }

    .preview-block {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        border: var(--border-width-S, 1px) solid var(--border-neutral-strong, #d8d8db);

        & img {
            border-radius: 50%;
            align-self: center;
        }
    }

    .image-selector :global(img) {
        border: 1px solid var(--border-neutral);
    }
</style>
