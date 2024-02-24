<script lang="ts">
    import { ModalWrapper } from '.';
    import { Form } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { toLocaleDate } from '$lib/helpers/date';

    export let show: boolean;
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };

    function getPreview(bucketId: string, fileId: string) {
        return (
            sdk.forProject.storage.getFilePreview(bucketId, fileId, 64, 64).toString() +
            '&mode=admin'
        );
    }

    let currentBucket: Models.Bucket = null;
    const buckets = sdk.forProject.storage.listBuckets().then((n) => {
        currentBucket = n.buckets[0] ?? null;

        return n;
    });

    $: files = currentBucket && sdk.forProject.storage.listFiles(currentBucket.$id);
</script>

<ModalWrapper bind:show size="huge">
    <Form isModal {onSubmit} class="u-stretch">
        <header class="modal-header u-margin-block-end-0">
            <div class="u-flex u-main-space-between u-cross-center u-gap-16">
                <h4 class="modal-title heading-level-5">Select file</h4>
                <button class="button is-text is-small is-only-icon" aria-label="Close modal">
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
                            loading
                        {:then response}
                            {#each response.buckets as bucket}
                                <li class="drop-list-item">
                                    <button
                                        class="drop-button"
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
                        <label class="label" for="buckets">Buckets</label>
                        <div class="select u-width-full-line">
                            <select name="pets" id="buckets">
                                <option value="">Select option</option>
                                <option value="1">Option 1</option>
                                <option value="2">Option 2</option>
                                <option value="3">Option 3</option>
                                <option value="4">Option 4</option>
                                <option value="5">Option 5</option>
                                <option value="6">Option 6</option>
                            </select>
                            <span class="icon-cheveron-down" aria-hidden="true"></span>
                        </div>
                    </div>

                    {#if currentBucket}
                        <header class="u-flex-vertical u-gap-32">
                            <div class="u-flex u-gap-16">
                                <h5 class="heading-level-6 u-trim u-min-width-0">
                                    {currentBucket?.name}
                                </h5>
                                <div class="tag u-min-width-0">{currentBucket?.$id}</div>
                            </div>
                            <div
                                class="u-flex u-main-space-between u-gap-16 u-flex-vertical-mobile">
                                <div
                                    class="input-text-wrapper is-with-end-button u-width-full-line u-max-width-500"
                                    style="--amount-of-buttons:1">
                                    <input type="search" placeholder="Search" />
                                    <div class="icon-search" aria-hidden="true"></div>
                                    <button
                                        class="button is-text is-only-icon"
                                        aria-label="Clear search"
                                        style="--button-size:1.5rem;">
                                        <span class="icon-x" aria-hidden="true"></span>
                                    </button>
                                </div>
                                <div class="u-flex u-gap-16">
                                    <div class="toggle-button">
                                        <ul class="toggle-button-list">
                                            <li class="toggle-button-item">
                                                <button
                                                    class="toggle-button-element"
                                                    aria-label="List View">
                                                    <span class="icon-view-list" aria-hidden="true"
                                                    ></span>
                                                </button>
                                            </li>
                                            <li class="toggle-button-item">
                                                <button
                                                    class="toggle-button-element is-selected"
                                                    aria-label="Grid View">
                                                    <span class="icon-view-grid" aria-hidden="true"
                                                    ></span>
                                                </button>
                                            </li>
                                        </ul>
                                    </div>

                                    <div class="button is-secondary is-full-width-in-stack-mobile">
                                        <span class="icon-upload" aria-hidden="true"></span>
                                        <span>Upload</span>
                                    </div>
                                </div>
                            </div>
                        </header>
                        <div class="u-flex-vertical u-stretch">
                            <table class="table is-table-row-medium-size is-remove-outer-styles">
                                <thead class="table-thead">
                                    <tr class="table-row">
                                        <th class="table-thead-col">
                                            <span class="eyebrow-heading-3">Filename</span>
                                        </th>
                                        <th
                                            class="table-thead-col is-only-desktop"
                                            style="--p-col-width:140">
                                            <span class="eyebrow-heading-3">Type</span>
                                        </th>
                                        <th
                                            class="table-thead-col is-only-desktop"
                                            style="--p-col-width:100">
                                            <span class="eyebrow-heading-3">Size</span>
                                        </th>
                                        <th
                                            class="table-thead-col is-only-desktop"
                                            style="--p-col-width:120">
                                            <span class="eyebrow-heading-3">Created</span>
                                        </th>
                                        <th class="table-thead-col" style="--p-col-width:40"></th>
                                    </tr>
                                </thead>
                                {#if files}
                                    {#await files}
                                        loading
                                    {:then response}
                                        <tbody class="table-tbody">
                                            {#each response.files as file}
                                                <tr class="table-row">
                                                    <td class="table-col" data-title="Name">
                                                        <div
                                                            class="u-inline-flex u-cross-center u-gap-12">
                                                            <input type="checkbox" id="item1" />
                                                            <span class="image">
                                                                <img
                                                                    class="avatar"
                                                                    width="32"
                                                                    height="32"
                                                                    src={getPreview(
                                                                        currentBucket.$id,
                                                                        file.$id
                                                                    )}
                                                                    alt="asd" />
                                                            </span>
                                                            <label
                                                                for="item1"
                                                                class="text u-break-word u-line-height-1-5"
                                                                >{file.name}</label>
                                                        </div>
                                                    </td>
                                                    <td
                                                        class="table-col is-only-desktop"
                                                        data-title="Type">
                                                        <div class="tag">
                                                            <span class="text"
                                                                >{file.mimeType}</span>
                                                        </div>
                                                    </td>
                                                    <td
                                                        class="table-col is-only-desktop"
                                                        data-title="Size">
                                                        <span class="text"
                                                            >{calculateSize(
                                                                file.sizeOriginal
                                                            )}</span>
                                                    </td>
                                                    <td
                                                        class="table-col is-only-desktop"
                                                        data-title="Created">
                                                        <time class="text"
                                                            >{toLocaleDate(file.$createdAt)}</time>
                                                    </td>
                                                    <td class="table-col u-overflow-visible">
                                                        <button
                                                            class="button is-text is-only-icon"
                                                            aria-label="more options">
                                                            <span
                                                                class="icon-dots-horizontal"
                                                                aria-hidden="true"></span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            {/each}
                                        </tbody>
                                    {/await}
                                {/if}
                            </table>
                        </div>
                    {/if}
                </article>
            </div>
        </div>
        <div class="modal-footer u-margin-block-start-0">
            <div class="u-flex u-main-end u-gap-16">
                <button class="button is-text">
                    <span class="text">Cancel</span>
                </button>
                <button class="button">
                    <span class="text">Select</span>
                </button>
            </div>
        </div>
    </Form>
</ModalWrapper>
