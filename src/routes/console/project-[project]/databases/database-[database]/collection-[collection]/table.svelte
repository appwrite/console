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
    import { organization } from '$lib/stores/organization';
    import { preferences } from '$lib/stores/preferences';
    import { teamPrefs } from '$lib/stores/team';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import type Attribute from './document-[document]/attribute.svelte';
    import RelationshipsModal from './relationshipsModal.svelte';
    import { attributes, collection, columns } from './store';

    export let data: PageData;

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    let showRelationships = false;
    let selectedRelationship: Models.AttributeRelationship = null;
    let relationshipData: [];

    onMount(() => {
        teamPrefs.load($organization.$id);
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

    function isRelationship(attr: Partial<Attribute>): attr is Models.AttributeRelationship {
        return attr?.type === 'relationship';
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
                            {@const args = $teamPrefs?.displayNames?.[attr.relatedCollection] ?? [
                                '$id'
                            ]}
                            {#if attr?.relationType === 'oneToOne' || attr?.relationType === 'manyToOne'}
                                <TableCell title={column.title}>
                                    <button
                                        class="button is-text link"
                                        type="button"
                                        on:click|preventDefault|stopPropagation={() =>
                                            goto(
                                                `${base}/console/project-${projectId}/databases/database-${databaseId}/collection-${attr.relatedCollection}`
                                            )}>
                                        {#each args as arg, i}
                                            {#if arg !== undefined}
                                                {i ? '|' : ''}
                                                <span class="text">
                                                    {document[column.id]?.[arg]}
                                                </span>
                                            {/if}
                                        {/each}
                                    </button>
                                </TableCell>
                            {:else}
                                <TableCell>
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

<RelationshipsModal bind:show={showRelationships} {selectedRelationship} data={relationshipData} />
