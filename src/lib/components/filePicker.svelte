<script lang="ts">
    import { Id, ModalWrapper, Trim } from '.';
    import { Button, Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { ID, Query, Permission, Role } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { toLocaleDate } from '$lib/helpers/date';
    import {
        Table,
        TableBody,
        TableRowButton,
        TableHeader,
        TableCell,
        TableCellText,
        TableCellHead
    } from '$lib/elements/table';
    import InputSearch from '$lib/elements/forms/inputSearch.svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import Heading from './heading.svelte';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import Empty from './empty.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

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

    function submitForm() {
        onSelect(currentFile);
        closeModal();
    }

    function getPreview(bucketId: string, fileId: string, size: number = 64) {
        return (
            sdk
                .forProject($page.params.region, $page.params.project)
                .storage.getFilePreview(bucketId, fileId, size, size)
                .toString() + '&mode=admin'
        );
    }

    async function uploadFile() {
        try {
            uploading = true;
            const file = await sdk
                .forProject($page.params.region, $page.params.project)
                .storage.createFile(selectedBucket, ID.unique(), fileSelector.files[0], [
                    Permission.read(Role.any())
                ]);
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
        const response = await sdk
            .forProject($page.params.region, $page.params.project)
            .storage.listBuckets();
        const bucket = response.buckets[0] ?? null;
        if (bucket) {
            currentBucket = bucket;
            selectedBucket = bucket.$id;
        }

        return response;
    }

    $: files =
        currentBucket &&
        sdk
            .forProject($page.params.region, $page.params.project)
            .storage.listFiles(
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

<ModalWrapper bind:show size="huge">
    <Form isModal onSubmit={submitForm} class="u-stretch">
        <header class="modal-header u-margin-block-end-0">
            <div class="u-flex u-main-space-between u-cross-center u-gap-16">
                <h4 class="modal-title heading-level-5">Select file</h4>
                <button
                    type="button"
                    on:click={closeModal}
                    class="button is-text is-small is-only-icon"
                    aria-label="Close modal">
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            </div>
        </header>
        <div
            class="modal-content u-stretch u-flex-vertical u-padding-0 u-margin-block-0 u-overflow-visible">
            <div class="u-flex u-min-height-0 u-stretch">
                <aside
                    class="drop-section u-width-200 u-padding-16
                            u-flex-vertical u-gap-8
                            u-flex-shrink-0 u-margin-inline-0 u-overflow-y-auto is-not-mobile">
                    <h6
                        class="eyebrow-heading-3"
                        style:--heading-text-color="var(--color-neutral-50)">
                        Buckets
                    </h6>
                    <ul class="drop-list">
                        {#await buckets}
                            <div class="u-flex u-main-center">
                                <div class="loader" />
                            </div>
                        {:then response}
                            {#each response.buckets as bucket}
                                {@const isSelected = bucket.$id === selectedBucket}
                                <li class="drop-list-item">
                                    <button
                                        type="button"
                                        class="drop-button"
                                        class:is-selected={isSelected}
                                        on:click={() => selectBucket(bucket)}>
                                        <span>{bucket.name}</span>
                                    </button>
                                </li>
                            {:else}
                                <li class="drop-list-item">
                                    <span class="drop-button">No buckets found</span>
                                </li>
                            {/each}
                        {/await}
                    </ul>
                </aside>
                <article
                    style:padding-inline="calc(var(--p-modal-padding))"
                    class="modal-content-main u-flex-vertical u-gap-24 u-sep-inline-start u-flex-basis-1000 u-padding-block-24 u-overflow-y-auto">
                    <div class="is-only-mobile">
                        {#await buckets}
                            loading
                        {:then response}
                            {#if currentBucket?.$id}
                                <FormList>
                                    <InputSelect
                                        wrapperTag="div"
                                        label="Buckets"
                                        options={response.buckets.map((n) => ({
                                            value: n.$id,
                                            label: n.name
                                        }))}
                                        bind:value={currentBucket.$id}
                                        id="buckets" />
                                </FormList>
                            {/if}
                        {/await}
                    </div>
                    {#await buckets}
                        <div class="u-flex-vertical u-stretch u-position-relative u-main-center">
                            <div
                                class="u-position-absolute u-width-full-line u-flex u-flex-vertical u-main-center u-cross-center u-gap-16 u-margin-block-start-32"
                                style="inset-inline-start: 0;">
                                <div class="loader" />
                                <p class="text">Loading files...</p>
                            </div>
                        </div>
                    {:then response}
                        {#if response?.total}
                            {#if currentBucket}
                                <header class="u-flex-vertical u-gap-32">
                                    <div class="u-flex u-gap-16">
                                        <h5 class="heading-level-6 u-trim u-min-width-0">
                                            {currentBucket?.name}
                                        </h5>
                                        <Id value={currentBucket?.$id} event="bucket">
                                            {currentBucket?.$id}
                                        </Id>
                                    </div>
                                    <div
                                        class="u-flex u-main-space-between u-gap-16 u-flex-vertical-mobile">
                                        <InputSearch
                                            placeholder="Search files"
                                            bind:value={$search}
                                            disabled={!searchEnabled}
                                            style="min-inline-size: 17.5rem; block-size: 100%" />
                                        <div class="u-flex u-gap-16">
                                            <div class="toggle-button">
                                                <ul class="toggle-button-list">
                                                    <li class="toggle-button-item">
                                                        <button
                                                            on:click={() => (view = 'list')}
                                                            disabled={!searchEnabled}
                                                            type="button"
                                                            class="toggle-button-element"
                                                            class:is-selected={view === 'list'}
                                                            aria-label="List View">
                                                            <span
                                                                class="icon-view-list"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </li>
                                                    <li class="toggle-button-item">
                                                        <button
                                                            on:click={() => (view = 'grid')}
                                                            disabled={!searchEnabled}
                                                            type="button"
                                                            class="toggle-button-element"
                                                            class:is-selected={view === 'grid'}
                                                            aria-label="Grid View">
                                                            <span
                                                                class="icon-view-grid"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>

                                            <Button
                                                secondary
                                                class="is-full-width-in-stack-mobile u-height-100-percent"
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
                                                    <span class="icon-upload" aria-hidden="true"
                                                    ></span>
                                                    <span>Upload</span>
                                                {/if}
                                            </Button>
                                        </div>
                                    </div>
                                </header>

                                {#if files}
                                    {#await files}
                                        <div
                                            class="u-flex-vertical u-stretch u-position-relative u-main-center">
                                            <div
                                                class="u-position-absolute u-width-full-line u-flex u-flex-vertical u-main-center u-cross-center u-gap-16 u-margin-block-start-32"
                                                style="inset-inline-start: 0;">
                                                <div class="loader" />
                                                <p class="text">Loading files...</p>
                                            </div>
                                        </div>
                                    {:then response}
                                        <div class="u-flex-vertical u-stretch">
                                            {#if response?.files?.length}
                                                {#if view === 'grid'}
                                                    <ul
                                                        class="grid-box"
                                                        style="--grid-gap:40px; --grid-item-size:120px; --grid-item-size-small-screens:100px;">
                                                        {#each response?.files as file}
                                                            <li>
                                                                <div
                                                                    class="u-flex-vertical u-gap-8">
                                                                    <div
                                                                        role="button"
                                                                        style:background-size="cover"
                                                                        style:background-image={`url(${getPreview(
                                                                            currentBucket.$id,
                                                                            file.$id,
                                                                            360
                                                                        )})`}
                                                                        on:click={() =>
                                                                            selectFile(file)}
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
                                                    <Table noMargin noStyles transparent dense>
                                                        <TableHeader>
                                                            <TableCellHead
                                                                ><span
                                                                    class="u-margin-inline-start-8"
                                                                    >Filename</span
                                                                ></TableCellHead>
                                                            <TableCellHead width={140} onlyDesktop>
                                                                ID
                                                            </TableCellHead>
                                                            <TableCellHead width={100} onlyDesktop>
                                                                Type
                                                            </TableCellHead>
                                                            <TableCellHead width={100} onlyDesktop>
                                                                Size
                                                            </TableCellHead>
                                                            <TableCellHead width={120} onlyDesktop>
                                                                Created
                                                            </TableCellHead>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {#each response?.files as file}
                                                                <TableRowButton
                                                                    on:click={() =>
                                                                        selectFile(file)}>
                                                                    <TableCell title="Filename">
                                                                        <div
                                                                            class="u-inline-flex u-cross-center u-gap-12">
                                                                            <input
                                                                                type="radio"
                                                                                class="is-small u-margin-inline-start-8"
                                                                                name="file"
                                                                                value={file.$id}
                                                                                style:pointer-events="none"
                                                                                checked={selectedFile ===
                                                                                    file.$id} />
                                                                            <span class="image">
                                                                                <img
                                                                                    class="avatar"
                                                                                    style:border-radius="var(--border-radius-xsmall)"
                                                                                    width="28"
                                                                                    height="28"
                                                                                    src={getPreview(
                                                                                        currentBucket.$id,
                                                                                        file.$id
                                                                                    )}
                                                                                    alt={file.name} />
                                                                            </span>
                                                                            <Trim alternativeTrim>
                                                                                {file.name}
                                                                            </Trim>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCellText
                                                                        title="ID"
                                                                        onlyDesktop>
                                                                        <Id value={file.$id}
                                                                            >{file.$id}</Id>
                                                                    </TableCellText>
                                                                    <TableCellText
                                                                        title="Type"
                                                                        onlyDesktop>
                                                                        {file.mimeType}
                                                                    </TableCellText>
                                                                    <TableCellText
                                                                        title="Size"
                                                                        onlyDesktop>
                                                                        {calculateSize(
                                                                            file.sizeOriginal
                                                                        )}
                                                                    </TableCellText>
                                                                    <TableCellText
                                                                        title="Created"
                                                                        onlyDesktop>
                                                                        {toLocaleDate(
                                                                            file.$createdAt
                                                                        )}
                                                                    </TableCellText>
                                                                </TableRowButton>
                                                            {/each}
                                                        </TableBody>
                                                    </Table>
                                                {/if}
                                            {:else if $search}
                                                <article
                                                    style:--card-bg-color="transparent"
                                                    style:--shadow-small="none"
                                                    style:--color-border="var(--color-neutral-15)"
                                                    class="card u-grid u-cross-center u-width-full-line common-section is-border-dashed">
                                                    <div
                                                        class="u-flex u-flex-vertical u-cross-center u-gap-24 u-overflow-hidden">
                                                        <div class="common-section">
                                                            <div
                                                                class="u-text-center common-section">
                                                                <b class="body-text-2 u-bold"
                                                                    >Sorry we couldn't find "{$search}"</b>
                                                                <p>
                                                                    There are no files that match
                                                                    your search.
                                                                </p>
                                                            </div>
                                                            <div
                                                                class="u-flex u-gap-16 common-section u-main-center">
                                                                <Button
                                                                    secondary
                                                                    on:click={() => ($search = '')}
                                                                    >Clear search</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            {:else}
                                                <Empty
                                                    single
                                                    noMedia
                                                    --card-bg-color="transparent"
                                                    --shadow-small="none"
                                                    --color-border="var(--color-neutral-15)">
                                                    <div class="common-section">
                                                        <div class="u-text-center common-section">
                                                            <Heading
                                                                size="7"
                                                                tag="h2"
                                                                trimmed={false}>
                                                                No files found within this bucket.
                                                            </Heading>
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
                                        </div>
                                    {/await}
                                {/if}
                            {/if}
                        {:else}
                            <Empty
                                single
                                noMedia
                                --card-bg-color="transparent"
                                --shadow-small="none"
                                --color-border="var(--color-neutral-15)">
                                <div class="u-text-center u-flex-vertical u-cross-center u-gap-24">
                                    <Heading size="7" tag="h2" trimmed={false}>
                                        No buckets found
                                    </Heading>
                                    <Button
                                        secondary
                                        external
                                        href={`${base}/project-${$page.params.region}-${$page.params.project}/storage`}>
                                        Create bucket
                                    </Button>
                                </div>
                            </Empty>
                        {/if}
                    {/await}
                </article>
            </div>
        </div>
        <div class="modal-footer u-margin-block-start-0">
            <div class="u-flex u-main-end u-gap-16">
                <Button text on:click={closeModal}>Cancel</Button>
                <Button submit disabled={selectedBucket === null || selectedFile === null}
                    >Select</Button>
            </div>
        </div>
    </Form>
</ModalWrapper>

<style lang="scss">
    input[type='radio']:where(:indeterminate) {
        --p-bg-color: var(--p-bg-color-default);
        --p-border-color: var(--p-border-color-default);
    }
</style>
