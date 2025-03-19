<script lang="ts">
    import { Id } from '.';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { ID, Query, Permission, Role } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import InputSearch from '$lib/elements/forms/inputSearch.svelte';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import DualTimeView from './dualTimeView.svelte';
    import {
        Layout,
        Typography,
        Modal,
        ActionMenu,
        Table,
        Spinner,
        ToggleButton,
        Selector,
        Empty,
        Card
    } from '@appwrite.io/pink-svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { IconCheck, IconViewGrid, IconViewList } from '@appwrite.io/pink-icons-svelte';

    export let show: boolean;
    export let mimeTypeQuery: string = 'image/';
    export let selectedBucket: string = null;
    export let selectedFile: string = null;
    export let onSelect: (e: Models.File) => void;

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

    $: files =
        currentBucket &&
        sdk.forProject.storage
            .listFiles(
                currentBucket.$id,
                [Query.startsWith('mimeType', mimeTypeQuery), Query.orderDesc('$createdAt')],
                $search || undefined
            )
            .then((response) => {
                if ($search === '') {
                    searchEnabled = response.total > 0;
                }

                return response;
            });

    $: if ($search) {
        resetFile();
    }
</script>

<svelte:document on:visibilitychange={handleVisibilityChange} />

<Form {onSubmit}>
    <Modal bind:open={show} title="Select file" size="l">
        <Layout.Stack direction="row" height="50vh">
            <aside>
                <Typography.Caption variant="500">Buckets</Typography.Caption>
                {#await buckets}
                    <div class="u-flex u-main-center">
                        <div class="loader" />
                    </div>
                {:then response}
                    <ActionMenu.Root>
                        {#each response.buckets as bucket}
                            {@const isSelected = bucket.$id === selectedBucket}
                            <ActionMenu.Item.Button
                                on:click={() => selectBucket(bucket)}
                                leadingIcon={isSelected ? IconCheck : undefined}>
                                {bucket.name}
                            </ActionMenu.Item.Button>
                        {:else}
                            <ActionMenu.Item.Button>No buckets found</ActionMenu.Item.Button>
                        {/each}
                    </ActionMenu.Root>
                {/await}
            </aside>

            <Layout.Stack>
                {#await buckets then response}
                    {#if response?.total}
                        {#if currentBucket}
                            <Layout.Stack>
                                <Layout.Stack direction="row" alignItems="center">
                                    <Typography.Title>{currentBucket?.name}</Typography.Title>
                                    <Id value={currentBucket?.$id} event="bucket">
                                        {currentBucket?.$id}
                                    </Id>
                                </Layout.Stack>
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
                                    <Button
                                        secondary
                                        disabled={uploading}
                                        on:click={() => fileSelector.click()}>
                                        <input
                                            tabindex="-1"
                                            type="file"
                                            accept="image/*"
                                            class="u-hide"
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
                                </Layout.Stack>
                            </Layout.Stack>

                            {#if files}
                                {#await files}
                                    <Layout.Stack
                                        justifyContent="center"
                                        alignContent="center"
                                        alignItems="center"
                                        height="100%">
                                        <Spinner size="l" />
                                        <span>Loading files...</span>
                                    </Layout.Stack>
                                {:then response}
                                    {#if response?.files?.length}
                                        {#if view === 'grid'}
                                            <Layout.Grid
                                                columnsXXS={1}
                                                columnsXS={2}
                                                columnsS={3}
                                                columns={4}>
                                                {#each response?.files as file}
                                                    <Card.Selector
                                                        group="files"
                                                        name="files"
                                                        value={file.$id}
                                                        src={getPreview(
                                                            currentBucket.$id,
                                                            file.$id,
                                                            360
                                                        )}
                                                        on:click={() => selectFile(file)} />
                                                {/each}
                                            </Layout.Grid>
                                        {/if}
                                        {#if view === 'list'}
                                            <Table.Root
                                                let:root
                                                columns={[
                                                    { id: 'filename', width: { min: 140 } },
                                                    { id: 'id', width: { min: 100 } },
                                                    { id: 'type', width: { min: 100 } },
                                                    { id: 'size', width: { min: 100 } },
                                                    { id: 'created', width: { min: 120 } }
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
                                                {#each response?.files as file}
                                                    <Table.Row.Button
                                                        {root}
                                                        on:click={() => selectFile(file)}>
                                                        <Table.Cell column="filename" {root}>
                                                            <div
                                                                class="u-inline-flex u-cross-center u-gap-12">
                                                                <Selector.Radio
                                                                    name="file"
                                                                    group="file"
                                                                    value={file.$id}
                                                                    checked={file.$id ===
                                                                        selectedFile} />
                                                                <img
                                                                    style:border-radius="var(--border-radius-xsmall)"
                                                                    width="28"
                                                                    height="28"
                                                                    src={getPreview(
                                                                        currentBucket.$id,
                                                                        file.$id
                                                                    )}
                                                                    alt={file.name} />
                                                                <Typography.Text truncate>
                                                                    {file.name}
                                                                </Typography.Text>
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
                                                            <DualTimeView time={file.$createdAt} />
                                                        </Table.Cell>
                                                    </Table.Row.Button>
                                                {/each}
                                            </Table.Root>
                                        {/if}
                                    {:else if $search}
                                        <Empty
                                            type="secondary"
                                            title={`Sorry we couldn't find "${$search}"`}
                                            description="There are no files that match your search.">
                                            <Button
                                                secondary
                                                slot="actions"
                                                on:click={() => ($search = '')}
                                                >Clear search</Button>
                                        </Empty>
                                    {:else}
                                        <Empty title="No files found within this bucket.">
                                            <Button
                                                secondary
                                                slot="actions"
                                                disabled={uploading}
                                                on:click={() => fileSelector.click()}
                                                >Upload file</Button>
                                        </Empty>
                                    {/if}
                                {/await}
                            {/if}
                        {/if}
                    {:else}
                        <Empty title="No buckets found">
                            <Button
                                slot="actions"
                                secondary
                                external
                                href={`${base}/project-${$page.params.project}/storage`}>
                                Create bucket
                            </Button>
                        </Empty>
                    {/if}
                {/await}
            </Layout.Stack>
        </Layout.Stack>
        <svelte:fragment slot="footer">
            <Layout.Stack direction="row" justifyContent="flex-end">
                <Button text on:click={closeModal}>Cancel</Button>
                <Button submit disabled={selectedBucket === null || selectedFile === null}
                    >Select</Button>
            </Layout.Stack>
        </svelte:fragment>
    </Modal>
</Form>
