<script lang="ts">
    import {
        TableScroll,
        TableRowLink,
        TableBody,
        TableHeader,
        TableCellHead,
        TableCell
    } from '$lib/elements/table';
    import { Empty, Copy, Heading, ViewSelector, CustomPagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { wizard } from '$lib/stores/wizard';
    import Create from '../createDocument.svelte';
    import type { PageData } from './$types';
    import { collection } from '../store';
    import { page } from '$app/stores';
    import { Dependencies, PAGE_LIMIT } from '$lib/constants';
    import CreateAttribute from '../createAttribute.svelte';
    import { tooltip } from '$lib/actions/tooltip';
    import { columns } from './store';
    import { onMount } from 'svelte';
    import RelationshipsModal from './relationshipsModal.svelte';
    import CreateAttributeDropdown from '../attributes/createAttributeDropdown.svelte';
    import InputSelectSearch from '$lib/elements/forms/inputSelectSearch.svelte';

    export let data: PageData;
    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    let showCreateAttribute = false;
    let showRelationships = false;
    let selectedRelationship: string[] = null;
    let showCreateDropdown = false;
    let selectedAttribute: string = null;

    function openWizard() {
        wizard.start(Create);
    }

    onMount(() => {
        columns.set([
            ...$collection.attributes.map((attribute) => ({
                id: attribute.key,
                title: attribute.key,
                type: attribute.type,
                show: true
            }))
        ]);
    });

    function formatArray(array: unknown[]) {
        if (array.length === 0) return '[ ]';

        let formattedFields: string[] = [];
        for (const item of array) {
            if (typeof item === 'string') {
                formattedFields.push(`"${item}"`);
            } else {
                formattedFields.push(`${item}`);
            }
        }

        return `[${formattedFields.join(', ')}]`;
    }

    function formatColumn(column: unknown) {
        let formattedColumn: string;

        if (typeof column === 'string') {
            formattedColumn = column;
        } else if (Array.isArray(column)) {
            formattedColumn = formatArray(column);
        } else if (column === null) {
            formattedColumn = 'n/a';
        } else {
            formattedColumn = `${column}`;
        }

        return {
            value:
                formattedColumn.length > 20
                    ? `${formattedColumn.slice(0, 20)}...`
                    : formattedColumn,
            truncated: formattedColumn.length > 20,
            whole: formattedColumn
        };
    }

    type Option = {
        value: string;
        label: string;
        name: string;
    };

    const selectOptions: Option[] = [
        {
            value: '1',
            label: 'first-ec68ac3515e4bc06',
            name: 'Option 1'
        },
        {
            value: '2',
            label: 'second-ec68ac3521e4bc06',
            name: 'Option 2'
        }
    ];

    let selectSearch = '';
    let selectValue = '';

    $: filteredOptions = (function filter() {
        return selectOptions.filter((option) =>
            option.label.toLowerCase().includes(selectSearch.toLowerCase())
        );
    })();
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Documents</Heading>
        <div class="u-flex u-gap-16">
            <ViewSelector showToggle={false} {columns} />
            <Button
                disabled={!$collection?.attributes?.length}
                on:click={openWizard}
                event="create_document">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create document</span>
            </Button>
        </div>
    </div>

    <InputSelectSearch
        id="related"
        label="Related Collection"
        bind:search={selectSearch}
        bind:value={selectValue}
        required
        placeholder="Search by ID"
        options={filteredOptions}
        let:option={o}>
        <div class="u-flex u-gap-16">
            <span style:color="hsl(var(--color-neutral-70))">{o.label}</span>
            {o.name}
        </div>
    </InputSelectSearch>

    {#if $collection?.attributes?.length}
        {#if data.documents.total}
            <TableScroll isSticky>
                <TableHeader>
                    <TableCellHead eyebrow={false}>Document ID</TableCellHead>
                    {#each $columns as column}
                        {#if column.show}
                            <TableCellHead eyebrow={false}>{column.title}</TableCellHead>
                        {/if}
                    {/each}
                </TableHeader>
                <TableBody>
                    {#each data.documents.documents as document}
                        <TableRowLink
                            href={`${base}/console/project-${projectId}/databases/database-${databaseId}/collection-${$collection.$id}/document-${document.$id}`}>
                            <TableCell width={230}>
                                <Copy value={document.$id}>
                                    <Pill button>
                                        <span class="icon-duplicate" aria-hidden="true" />
                                        <span class="text u-trim-start">{document.$id}</span>
                                    </Pill>
                                </Copy>
                            </TableCell>

                            {#each $columns as column}
                                {#if column.show}
                                    {#if column.type === 'relationship'}
                                        {#if column.direction === 'one'}
                                            <TableCell title={column.title}>
                                                {document[column.id]}
                                            </TableCell>
                                        {:else}
                                            <TableCell>
                                                {@const itemsNum = column?.data?.lenght}
                                                <Button
                                                    on:click={() => {
                                                        showRelationships = true;
                                                        selectedRelationship = document;
                                                    }}
                                                    disabled={!itemsNum}>
                                                    Items <span class="inline-tag">{itemsNum}</span>
                                                </Button>
                                            </TableCell>
                                        {/if}
                                    {:else}
                                        {@const formatted = formatColumn(document[column.id])}
                                        <TableCell>
                                            <div
                                                use:tooltip={{
                                                    content: formatted.whole,
                                                    disabled: !formatted.truncated
                                                }}>
                                                {formatted.value}
                                            </div>
                                        </TableCell>
                                    {/if}
                                {/if}
                            {/each}
                        </TableRowLink>
                    {/each}
                </TableBody>
            </TableScroll>

            <CustomPagination
                limit={PAGE_LIMIT}
                name="Documents"
                path={`/console/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}`}
                offset={data.offset}
                total={data.documents.total}
                dependencies={[Dependencies.DOCUMENTS]} />
        {:else}
            <Empty
                single
                href="https://appwrite.io/docs/databases#create-documents"
                target="document"
                on:click={openWizard} />
        {/if}
    {:else}
        <Empty single target="attribute" on:click={() => (showCreateDropdown = true)}>
            <div class="u-text-center">
                <Heading size="7" tag="h2">Create your first attribute to get started.</Heading>
                <p class="body-text-2 u-margin-block-start-4">
                    Need a hand? Check out our documentation.
                </p>
            </div>
            <div class="u-flex u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/databases#attributes"
                    text
                    event="empty_documentation"
                    ariaLabel={`create {target}`}>Documentation</Button>
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
            </div>
        </Empty>
    {/if}
</Container>

<CreateAttribute bind:showCreate={showCreateAttribute} bind:selectedOption={selectedAttribute} />
<RelationshipsModal bind:show={showRelationships} {selectedRelationship} />
