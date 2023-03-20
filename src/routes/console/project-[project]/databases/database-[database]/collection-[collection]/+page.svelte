<script lang="ts">
    import {
        TableScroll,
        TableRowLink,
        TableBody,
        TableHeader,
        TableCellHead,
        TableCell
    } from '$lib/elements/table';
    import { Empty, Copy, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { wizard } from '$lib/stores/wizard';
    import Create from './createDocument.svelte';
    import type { PageData } from './$types';
    import { collection } from './store';
    import { page } from '$app/stores';
    import { PAGE_LIMIT } from '$lib/constants';
    import CreateAttribute from './createAttribute.svelte';
    import { tooltip } from '$lib/actions/tooltip';

    export let data: PageData;
    let showCreateAttribute = false;

    function openWizard() {
        wizard.start(Create);
    }

    $: columns = [
        ...$collection.attributes.map((attribute) => ({
            key: attribute.key,
            title: attribute.key
        }))
    ];

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

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Documents</Heading>

        <Button
            disabled={!$collection?.attributes?.length}
            on:click={openWizard}
            event="create_document">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create document</span>
        </Button>
    </div>

    {#if $collection?.attributes?.length}
        {#if data.documents.total}
            <TableScroll isSticky>
                <TableHeader>
                    <TableCellHead width={200} eyebrow={false}>Document ID</TableCellHead>
                    {#each columns as column}
                        <TableCellHead eyebrow={false}>{column.title}</TableCellHead>
                    {/each}
                </TableHeader>
                <TableBody>
                    {#each data.documents.documents as document}
                        <TableRowLink
                            href={`${base}/console/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$collection.$id}/document-${document.$id}`}>
                            <TableCell width={230}>
                                <Copy value={document.$id}>
                                    <Pill button>
                                        <span class="icon-duplicate" aria-hidden="true" />
                                        <span class="text u-trim-start">{document.$id}</span>
                                    </Pill>
                                </Copy>
                            </TableCell>
                            {#each columns as column}
                                {@const formatted = formatColumn(document[column.key])}
                                <TableCell>
                                    <div
                                        use:tooltip={{
                                            content: formatted.whole,
                                            disabled: !formatted.truncated
                                        }}>
                                        {formatted.value}
                                    </div>
                                </TableCell>
                            {/each}
                        </TableRowLink>
                    {/each}
                </TableBody>
            </TableScroll>

            <div class="u-flex common-section u-main-space-between">
                <p class="text">Total results: {data.documents.total}</p>
                <Pagination limit={PAGE_LIMIT} offset={data.offset} sum={data.documents.total} />
            </div>
        {:else}
            <Empty
                single
                href="https://appwrite.io/docs/databases#create-documents"
                target="document"
                on:click={openWizard} />
        {/if}
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/databases#attributes"
            target="attribute"
            on:click={() => (showCreateAttribute = true)} />
    {/if}
</Container>

<CreateAttribute bind:showCreate={showCreateAttribute} />
