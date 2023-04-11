<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { preferences } from '$lib/stores/preferences';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import { isRelationship, isRelationshipToMany } from './document-[document]/attributes/store';
    import RelationshipsModal from './relationshipsModal.svelte';
    import { attributes, collection, columns } from './store';

    export let data: PageData;

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    let showRelationships = false;
    let selectedRelationship: Models.AttributeRelationship = null;
    let relationshipData: [];
    let displayNames = {};

    onMount(async () => {
        displayNames = preferences.getDisplayNames();
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
            formattedColumn = 'null';
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

    $: selected = preferences.getCustomCollectionColumns($page.params.collection);

    $: columns.set(
        $collection.attributes.map((attribute) => ({
            id: attribute.key,
            title: attribute.key,
            type: attribute.type,
            show: selected?.includes(attribute.key) ?? true
        }))
    );
</script>

<TableScroll isSticky>
    <TableHeader>
        <TableCellHead width={150} eyebrow={false}>Document ID</TableCellHead>
        {#each $columns.filter((n) => n.show) as column}
            {#if column.show}
                <TableCellHead eyebrow={false}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.documents.documents as document}
            <TableRowLink
                href={`${base}/console/project-${projectId}/databases/database-${databaseId}/collection-${$collection.$id}/document-${document.$id}`}>
                <TableCell>
                    <Copy value={document.$id}>
                        <Pill button trim>
                            <span class="icon-duplicate" aria-hidden="true" />
                            <span class="text">{document.$id}</span>
                        </Pill>
                    </Copy>
                </TableCell>

                {#each $columns as column}
                    {#if column.show}
                        {@const attr = $attributes.find((n) => n.key === column.id)}
                        {#if isRelationship(attr)}
                            {@const args = displayNames?.[attr.relatedCollection] ?? ['$id']}
                            <TableCell title={column.title}>
                                {#if !isRelationshipToMany(attr)}
                                    {#if document[column.id]}
                                        {@const related = document[column.id]}
                                        <button
                                            class="link u-flex u-gap-4 u-padding-block-8"
                                            type="button"
                                            on:click|preventDefault|stopPropagation={() =>
                                                goto(
                                                    `${base}/console/project-${projectId}/databases/database-${databaseId}/collection-${attr.relatedCollection}/document-${related.$id}`
                                                )}>
                                            {#each args as arg, i}
                                                {#if arg !== undefined}
                                                    {i ? '|' : ''}
                                                    <span class="text" data-private>
                                                        {related?.[arg]}
                                                    </span>
                                                {/if}
                                            {/each}
                                        </button>
                                    {:else}
                                        <span class="text">n/a</span>
                                    {/if}
                                {:else}
                                    {@const itemsNum = document[column.id]?.length}
                                    <button
                                        class="button is-text"
                                        on:click|preventDefault|stopPropagation={() => {
                                            relationshipData = document[column.id];
                                            showRelationships = true;
                                            selectedRelationship = attr;
                                        }}
                                        disabled={!itemsNum}>
                                        Items <span class="inline-tag">{itemsNum ?? 0}</span>
                                    </button>
                                {/if}
                            </TableCell>
                        {:else}
                            {@const formatted = formatColumn(document[column.id])}
                            <TableCell>
                                <div
                                    use:tooltip={{
                                        content: formatted.whole,
                                        disabled: !formatted.truncated
                                    }}
                                    data-private>
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

<RelationshipsModal bind:show={showRelationships} {selectedRelationship} data={relationshipData} />
