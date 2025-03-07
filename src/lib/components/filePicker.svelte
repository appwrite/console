<script lang="ts">
    import { Id, Trim } from '.';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { ID, Query, Permission, Role } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { toLocaleDate } from '$lib/helpers/date';
    import InputSearch from '$lib/elements/forms/inputSearch.svelte';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import {
        Layout,
        Typography,
        Modal,
        ActionMenu,
        Table,
        Spinner,
        ToggleButton,
        Selector,
        Empty
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
                <Typography.Eyebrow>Buckets</Typography.Eyebrow>
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
                                            <ul
                                                class="grid-box"
                                                style="--grid-gap:40px; --grid-item-size:120px; --grid-item-size-small-screens:100px;">
                                                {#each response?.files as file}
                                                    <li>
                                                        <div class="u-flex-vertical u-gap-8">
                                                            <div
                                                                role="button"
                                                                style:background-size="cover"
                                                                style:background-image={`url(${getPreview(
                                                                    currentBucket.$id,
                                                                    file.$id,
                                                                    360
                                                                )})`}
                                                                on:click={() => selectFile(file)}
                                                                on:keyup={clickOnEnter}
                                                                tabindex="0"
                                                                style:aspect-ratio="1/1"
                                                                style:display="flex"
                                                                style:align-items="flex-end"
                                                                style:flex-direction="row-reverse"
                                                                style:box-shadow="none"
                                                                class="card u-height-100-percent u-gap-16"
                                                                style="--card-padding:0.5rem;--card-padding-mobile:0.5rem; --card-border-radius:var(--border-radius-medium);">
                                                                <input
                                                                    class="u-position-absolute is-small u-margin-block-start-2"
                                                                    type="radio"
                                                                    name="file"
                                                                    value={file.$id}
                                                                    style:pointer-events="none"
                                                                    checked={selectedFile ===
                                                                        file.$id} />
                                                            </div>
                                                            <span class="u-text-center"
                                                                ><Trim alternativeTrim
                                                                    >{file.name}</Trim
                                                                ></span>
                                                        </div>
                                                    </li>
                                                {/each}
                                            </ul>
                                        {/if}
                                        {#if view === 'list'}
                                            <Table.Root>
                                                <svelte:fragment slot="header">
                                                    <Table.Header.Cell>Filename</Table.Header.Cell>
                                                    <Table.Header.Cell width="140px">
                                                        ID
                                                    </Table.Header.Cell>
                                                    <Table.Header.Cell width="100px">
                                                        Type
                                                    </Table.Header.Cell>
                                                    <Table.Header.Cell width="100px">
                                                        Size
                                                    </Table.Header.Cell>
                                                    <Table.Header.Cell width="120px">
                                                        Created
                                                    </Table.Header.Cell>
                                                </svelte:fragment>
                                                {#each response?.files as file}
                                                    <Table.Button on:click={() => selectFile(file)}>
                                                        <Table.Cell>
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
                                                        <Table.Cell>
                                                            <Id value={file.$id}>{file.$id}</Id>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            {file.mimeType}
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            {calculateSize(file.sizeOriginal)}
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            {toLocaleDate(file.$createdAt)}
                                                        </Table.Cell>
                                                    </Table.Button>
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
                                                slot=""
                                                on:click={() => ($search = '')}
                                                >Clear search</Button>
                                        </Empty>
                                    {:else}
                                        <Empty
                                            single
                                            --card-bg-color="transparent"
                                            --shadow-small="none"
                                            --border="var(--color-neutral-15)">
                                            <div class="common-section">
                                                <div class="u-text-center common-section">
                                                    <Typography.Title size="s">
                                                        No files found within this bucket.
                                                    </Typography.Title>
                                                    <p class="text u-line-height-1-5">
                                                        Need a hand? Learn more in our <a
                                                            class="link"
                                                            href="https://appwrite.io/docs/products/storage"
                                                            target="_blank"
                                                            rel="noopener noreferrer">
                                                            documentation</a
                                                        >.
                                                    </p>
                                                </div>
                                            </div>
                                        </Empty>
                                    {/if}
                                {/await}
                            {/if}
                        {/if}
                    {:else}
                        <Empty
                            single
                            --card-bg-color="transparent"
                            --shadow-small="none"
                            --border="var(--color-neutral-15)">
                            <div class="u-text-center u-flex-vertical u-cross-center u-gap-24">
                                <Typography.Title size="s">No buckets found</Typography.Title>
                                <Button
                                    secondary
                                    external
                                    href={`${base}/project-${$page.params.project}/storage`}>
                                    Create bucket
                                </Button>
                            </div>
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
