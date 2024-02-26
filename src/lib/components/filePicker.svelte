<script lang="ts">
    import { EmptySearch, Id, ModalWrapper, Trim } from '.';
    import { Button, Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { ID, Query } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { toLocaleDate } from '$lib/helpers/date';
    import {
        TableScroll,
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

    export let show: boolean;
    export let selectedBucket: string = null;
    export let selectedFile: string = null;
    export let onSelect: (e: Models.File) => void;

    let search = writable('');
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
                fileSelector.files[0]
            );
            search.set($search === null ? '' : null);
            selectedBucket = file.bucketId;
            selectedFile = file.$id;
        } catch (e) {
            console.error(e);
        } finally {
            uploading = false;
        }
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

    let currentBucket: Models.Bucket = null;
    let currentFile: Models.File = null;
    const buckets = sdk.forProject.storage.listBuckets().then((n) => {
        currentBucket = n.buckets[0] ?? null;

        return n;
    });

    $: files =
        currentBucket &&
        sdk.forProject.storage.listFiles(
            currentBucket.$id,
            [Query.startsWith('mimeType', 'image/'), Query.orderDesc('$createdAt')],
            $search || undefined
        );

    $: {
        selectedBucket = currentBucket?.$id;
        resetFile();
    }

    $: if ($search) {
        resetFile();
    }
</script>

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
                    <h6 class="eyebrow-heading-3">Buckets</h6>
                    <ul class="drop-list">
                        {#await buckets}
                            <div
                                class="u-position-absolute u-width-full-line u-flex u-flex-vertical u-main-center u-cross-center u-gap-16 u-margin-block-start-32"
                                style="inset-inline-start: 0;">
                                <div class="loader" />
                                <p class="text">Loading buckets...</p>
                            </div>
                        {:then response}
                            {#each response.buckets as bucket}
                                {@const isSelected = bucket.$id === selectedBucket}
                                <li class="drop-list-item">
                                    <button
                                        type="button"
                                        class="drop-button"
                                        class:is-selected={isSelected}
                                        on:click={() => (currentBucket = bucket)}>
                                        <span>{bucket.name}</span>
                                    </button>
                                </li>
                            {/each}
                        {/await}
                    </ul>
                </aside>
                <article
                    class="modal-content-main u-flex-vertical u-gap-32 u-sep-inline-start u-flex-basis-1000 u-padding-inline-32 u-padding-block-24 u-overflow-y-auto">
                    <div class="is-only-mobile">
                        {#await buckets}
                            loading
                        {:then response}
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
                        {/await}
                    </div>

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
                                    style="min-inline-size: 17.5rem" />
                                <div class="u-flex u-gap-16">
                                    <div class="toggle-button">
                                        <ul class="toggle-button-list">
                                            <li class="toggle-button-item">
                                                <button
                                                    on:click={() => (view = 'list')}
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
                                        class="is-full-width-in-stack-mobile"
                                        disabled={uploading}
                                        on:click={() => fileSelector.click()}
                                        on:keyup={clickOnEnter} />
                                        <input
                                            tabindex="-1"
                                            type="file"
                                            accept="image/*"
                                            class="u-hide"
                                            on:change={uploadFile}
                                            bind:this={fileSelector} />
                                        <span class="icon-upload" aria-hidden="true"></span>
                                        <span>Upload</span>
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
                                    {#if response.files?.length}
                                        {#if view === 'grid'}
                                            <ul
                                                class="grid-box"
                                                style="--grid-gap:2rem; --grid-item-size:10rem; --grid-item-size-small-screens:8rem;">
                                                {#each response.files as file}
                                                    <li>
                                                        <div
                                                            role="button"
                                                            style:background-image={`url(${getPreview(
                                                                currentBucket.$id,
                                                                file.$id,
                                                                360
                                                            )})`}
                                                            on:click={() => selectFile(file)}
                                                            on:keyup={clickOnEnter}
                                                            tabindex="0"
                                                            style:aspect-ratio="1/1"
                                                            class="card u-height-100-percent u-flex u-flex-vertical u-gap-16"
                                                            style="--card-padding:0.5rem; --card-border-radius:var(--border-radius-large);">
                                                            <input
                                                                class="u-position-absolute is-small u-margin-block-start-2"
                                                                type="radio"
                                                                name="file"
                                                                value={file.$id}
                                                                style:pointer-events="none"
                                                                checked={selectedFile ===
                                                                    file.$id} />
                                                        </div>
                                                    </li>
                                                {/each}
                                            </ul>
                                        {/if}
                                        {#if view === 'list'}
                                            <TableScroll noMargin transparent dense>
                                                <TableHeader>
                                                    <TableCellHead>Filename</TableCellHead>
                                                    <TableCellHead width={140} onlyDesktop
                                                        >Type</TableCellHead>
                                                    <TableCellHead width={100} onlyDesktop
                                                        >Size</TableCellHead>
                                                    <TableCellHead width={120} onlyDesktop
                                                        >Created</TableCellHead>
                                                </TableHeader>
                                                <TableBody>
                                                    {#each response.files as file}
                                                        <TableRowButton
                                                            on:click={() => selectFile(file)}>
                                                            <TableCell title="Filename">
                                                                <div
                                                                    class="u-inline-flex u-cross-center u-gap-12">
                                                                    <input
                                                                        type="radio"
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
                                                                    <Trim>
                                                                        {file.name}
                                                                    </Trim>
                                                                </div>
                                                            </TableCell>
                                                            <TableCellText title="Type" onlyDesktop>
                                                                {file.mimeType}
                                                            </TableCellText>
                                                            <TableCellText title="Size" onlyDesktop>
                                                                {calculateSize(file.sizeOriginal)}
                                                            </TableCellText>
                                                            <TableCellText
                                                                title="Created"
                                                                onlyDesktop>
                                                                {toLocaleDate(file.$createdAt)}
                                                            </TableCellText>
                                                        </TableRowButton>
                                                    {/each}
                                                </TableBody>
                                            </TableScroll>
                                        {/if}
                                    {:else if $search}
                                        <EmptySearch hidePages hidePagination>
                                            <div class="common-section">
                                                <div class="u-text-center common-section">
                                                    <b class="body-text-2 u-bold"
                                                        >Sorry we couldn't find "{$search}"</b>
                                                    <p>
                                                        There are no files that match your search.
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
                                        </EmptySearch>
                                    {:else}
                                        <EmptySearch hidePages hidePagination>
                                            <div class="common-section">
                                                <div class="u-text-center common-section">
                                                    <Heading size="7" tag="h2" trimmed={false}>
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
                                        </EmptySearch>
                                    {/if}
                                </div>
                            {/await}
                        {/if}
                    {/if}
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
