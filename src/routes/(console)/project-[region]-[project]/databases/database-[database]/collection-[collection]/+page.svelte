<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, EmptySearch, Heading, PaginationWithLimit } from '$lib/components';
    import { Filters, hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import type { ColumnType } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { canWriteCollections, canWriteDocuments } from '$lib/stores/roles';
    import { wizard } from '$lib/stores/wizard';
    import type { PageData } from './$types';
    import CreateAttributeDropdown from './attributes/createAttributeDropdown.svelte';
    import type { Option } from './attributes/store';
    import CreateAttribute from './createAttribute.svelte';
    import Create from './createDocument.svelte';
    import { collection, columns } from './store';
    import Table from './table.svelte';

    export let data: PageData;

    let showCreateAttribute = false;
    let showCreateDropdown = false;
    let selectedAttribute: Option['name'] = null;

    $: selected = preferences.getCustomCollectionColumns(
        $page.params.project,
        $page.params.collection
    );
    $: columns.set(
        $collection.attributes.map((attribute) => ({
            id: attribute.key,
            title: attribute.key,
            type: attribute.type as ColumnType,
            show: selected?.includes(attribute.key) ?? true,
            array: attribute?.array,
            format: 'format' in attribute && attribute?.format === 'enum' ? attribute.format : null,
            elements: 'elements' in attribute ? attribute.elements : null
        }))
    );

    function openWizard() {
        if (!$canWriteDocuments) return;
        wizard.start(Create);
    }

    $: hasAttributes = !!$collection.attributes.length;

    $: hasValidAttributes = $collection?.attributes?.some((attr) => attr.status === 'available');
</script>

{#key $page.params.collection}
    <Container>
        <div class="heading-grid u-main-justify-between u-cross-center">
            <Heading tag="h2" size="5">Documents</Heading>
            <div class="u-flex u-main-end is-only-mobile">
                <Button
                    disabled={!(hasAttributes && hasValidAttributes)}
                    on:click={openWizard}
                    event="create_document">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create document</span>
                </Button>
            </div>

            <Filters
                query={data.query}
                {columns}
                disabled={!(hasAttributes && hasValidAttributes)} />

            <div class="u-flex u-main-end u-gap-16">
                <ViewSelector
                    view={data.view}
                    {columns}
                    isCustomCollection
                    hideView
                    allowNoColumns
                    showColsTextMobile />
                <div class="is-not-mobile">
                    <Button
                        disabled={!(hasAttributes && hasValidAttributes)}
                        on:click={openWizard}
                        event="create_document">
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create document</span>
                    </Button>
                </div>
            </div>
        </div>

        {#if hasAttributes && hasValidAttributes}
            {#if data.documents.total}
                <Table {data} />

                <PaginationWithLimit
                    name="Documents"
                    limit={data.limit}
                    offset={data.offset}
                    total={data.documents.total} />
            {:else if $hasPageQueries}
                <EmptySearch hidePages>
                    <div class="common-section">
                        <div class="u-text-center common-section">
                            <b class="body-text-2 u-bold">Sorry, we couldn't find any documents.</b>
                            <p>There are no documents that match your filters.</p>
                        </div>
                        <div class="u-flex common-section u-main-center">
                            <Button
                                secondary
                                on:click={() => {
                                    queries.clearAll();
                                    queries.apply();
                                }}>
                                Clear filters
                            </Button>
                        </div>
                    </div>
                </EmptySearch>
            {:else}
                <Empty
                    allowCreate={$canWriteDocuments}
                    single
                    href="https://appwrite.io/docs/products/databases/documents"
                    target="document"
                    on:click={openWizard} />
            {/if}
        {:else}
            <Empty
                allowCreate={$canWriteCollections}
                single
                target="attribute"
                on:click={() => (showCreateDropdown = true)}>
                <div class="u-text-center">
                    <Heading size="7" tag="h2">Create an attribute to get started.</Heading>
                    <p class="body-text-2 u-bold u-margin-block-start-4">
                        Need a hand? Learn more in our documentation.
                    </p>
                </div>
                <div class="u-flex u-gap-16 u-main-center">
                    <Button
                        external
                        href="https://appwrite.io/docs/products/databases/collections#attributes"
                        text
                        event="empty_documentation"
                        ariaLabel={`create {target}`}>Documentation</Button>
                    {#if $canWriteCollections}
                        <CreateAttributeDropdown
                            bind:showCreateDropdown
                            bind:showCreate={showCreateAttribute}
                            bind:selectedOption={selectedAttribute}>
                            <Button
                                secondary
                                event="create_attribute"
                                on:click={() => {
                                    showCreateDropdown = !showCreateDropdown;
                                }}>
                                Create attribute
                            </Button>
                        </CreateAttributeDropdown>
                    {/if}
                </div>
            </Empty>
        {/if}
    </Container>
{/key}

<CreateAttribute bind:showCreate={showCreateAttribute} bind:selectedOption={selectedAttribute} />

<style lang="scss">
    .heading-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;

        @media (min-width: 768px) {
            :global(h2) {
                grid-column: span 2;
            }
        }
    }
</style>
