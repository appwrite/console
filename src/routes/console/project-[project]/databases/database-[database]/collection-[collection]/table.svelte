<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import RelationshipsModal from './relationshipsModal.svelte';
    import { collection, columns } from './store';

    export let data: PageData;

    const projectId = $page.params.project;
    const databaseId = $page.params.database;
    let showRelationships = false;
    let selectedRelationship: string = null;

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
</script>

<TableScroll isSticky>
    <TableHeader>
        <TableCellHead width={100} eyebrow={false}>Document ID</TableCellHead>
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

<RelationshipsModal bind:show={showRelationships} {selectedRelationship} />
