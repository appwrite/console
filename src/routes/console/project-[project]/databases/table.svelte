<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import InputCheckbox from '$lib/elements/forms/inputCheckbox.svelte';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { toggle } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { isHTMLInputElement } from '$lib/helpers/types';
    import type { PageData } from './$types';
    import { columns } from './store';

    export let data: PageData;
    const projectId = $page.params.project;

    let selected: string[] = [];
</script>

<TableScroll>
    <TableHeader>
        <TableCellHead width={10}>
            <InputCheckbox
                id="select-all"
                indeterminate={selected.length > 0 && selected.length < data.databases.total}
                value={selected.length === data.databases.total}
                on:click={(e) => {
                    if (!isHTMLInputElement(e.target)) return;
                    selected = e.target.checked
                        ? data.databases.databases.map((database) => database.$id)
                        : [];
                }} />
        </TableCellHead>
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.databases.databases as database}
            <TableRowLink
                href={`${base}/console/project-${projectId}/databases/database-${database.$id}`}>
                <TableCell>
                    <InputCheckbox
                        id="select-{database.$id}"
                        value={selected.includes(database.$id)}
                        on:click={(e) => {
                            // Prevent the link from being followed
                            e.preventDefault();
                            const el = e.currentTarget;
                            if (!isHTMLInputElement(el)) return;

                            selected = toggle(selected, database.$id);

                            // Hack to make sure the checkbox is checked, independent of the
                            // preventDefault() call above
                            window.setTimeout(() => {
                                el.checked = selected.includes(database.$id);
                            });
                        }} />
                </TableCell>
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key $columns}
                                <TableCell width={column.width} title={column.title}>
                                    <Id value={database.$id}>
                                        {database.$id}
                                    </Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'name'}
                            <TableCellText width={column.width} title={column.title}>
                                {database.name}
                            </TableCellText>
                        {:else}
                            <TableCellText width={column.width} title={column.title}>
                                {toLocaleDateTime(database[column.id])}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</TableScroll>
