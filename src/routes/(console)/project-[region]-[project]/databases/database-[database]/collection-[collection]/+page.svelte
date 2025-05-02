<script lang="ts">
    import { page } from '$app/state';
    import { Empty, EmptySearch, PaginationWithLimit } from '$lib/components';
    import { Filters, hasPageQueries, queries } from '$lib/components/filters';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { Button } from '$lib/elements/forms';
    import type { ColumnType } from '$lib/helpers/types';
    import { Container } from '$lib/layout';
    import { preferences } from '$lib/stores/preferences';
    import { canWriteCollections, canWriteDocuments } from '$lib/stores/roles';
    import { Card, Icon, Layout, Empty as PinkEmpty } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';
    import CreateAttributeDropdown from './attributes/createAttributeDropdown.svelte';
    import type { Option } from './attributes/store';
    import CreateAttribute from './createAttribute.svelte';
    import { collection, columns } from './store';
    import Table from './table.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { Submit, trackEvent } from '$lib/actions/analytics';

    export let data: PageData;

    let showCreateAttribute = false;
    let selectedAttribute: Option['name'] = null;

    $: selected = preferences.getCustomCollectionColumns(page.params.collection);
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
    $: hasAttributes = !!$collection.attributes.length;
    $: hasValidAttributes = $collection?.attributes?.some((attr) => attr.status === 'available');
</script>

{#key page.params.collection}
    <Container>
        <Layout.Stack direction="row" justifyContent="space-between">
            <Filters
                query={data.query}
                {columns}
                disabled={!(hasAttributes && hasValidAttributes)}
                analyticsSource="database_documents" />
            <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
                <ViewSelector view={data.view} {columns} hideView />
                <Button
                    disabled={!(hasAttributes && hasValidAttributes)}
                    href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/collection-${page.params.collection}/create`}
                    event="create_document">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Create document
                </Button>
            </Layout.Stack>
        </Layout.Stack>

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
                                    trackEvent(Submit.FilterClear, {
                                        source: 'database_documents'
                                    });
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
                    target="document">
                    <svelte:fragment slot="actions">
                        <Button
                            external
                            href="https://appwrite.io/docs/products/databases/documents"
                            text
                            event="empty_documentation"
                            size="s"
                            ariaLabel="create document">Documentation</Button>
                        <Button
                            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/collection-${page.params.collection}/create`}
                            secondary
                            disabled={!$canWriteDocuments}
                            size="s">
                            Create document
                        </Button>
                    </svelte:fragment>
                </Empty>
            {/if}
        {:else}
            <Card.Base padding="none">
                <PinkEmpty
                    title="Create an attribute to get started."
                    description="Need a hand? Learn more in our documentation.">
                    <slot name="actions" slot="actions">
                        <Button
                            external
                            href="https://appwrite.io/docs/products/databases/collections#attributes"
                            text
                            event="empty_documentation"
                            size="s">Documentation</Button>
                        {#if $canWriteCollections}
                            <CreateAttributeDropdown
                                bind:selectedOption={selectedAttribute}
                                bind:showCreate={showCreateAttribute}
                                let:toggle>
                                <Button secondary event="create_attribute" on:click={toggle}>
                                    Create attribute
                                </Button>
                            </CreateAttributeDropdown>
                        {/if}
                    </slot>
                </PinkEmpty>
            </Card.Base>
        {/if}
    </Container>
{/key}

{#if showCreateAttribute}
    <CreateAttribute
        bind:showCreate={showCreateAttribute}
        bind:selectedOption={selectedAttribute} />
{/if}
