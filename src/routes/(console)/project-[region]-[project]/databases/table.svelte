<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import { Id } from '$lib/components';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import { columns } from './store';
    import Cell from '$lib/elements/table/cell.svelte';

    export let data: PageData;
    const projectId = $page.params.project;

    function getPolicyDescription(cron: string): string {
        const [minute, hour, dayOfMonth, , dayOfWeek] = cron.split(' ');

        if (dayOfMonth !== '*') return 'Monthly';
        if (dayOfWeek !== '*') return 'Weekly on Mondays';
        if (minute !== '*' && hour === '*') return 'Hourly';
        if (hour !== '*') return 'Daily';
    }
</script>

<TableScroll>
    <TableHeader>
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.databases.databases as database (database.$id)}
            <TableRowLink
                href={`${base}/project-${$page.params.region}-${projectId}/databases/database-${database.$id}`}>
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
                        {:else if column.id === 'backup'}
                            {@const policies = data.policies?.[database.$id] ?? null}
                            {@const lastBackup = data.lastBackups?.[database.$id] ?? null}
                            {@const description = policies
                                ?.map((policy) => getPolicyDescription(policy.schedule))
                                .join(', ')}

                            <Cell title={column.title} width={column.width}>
                                <span
                                    class="u-trim"
                                    use:tooltip={{
                                        placement: 'bottom',
                                        disabled: !policies || !lastBackup,
                                        content: `Last backup: ${lastBackup}`
                                    }}>
                                    {#if !policies}
                                        <span class="icon-exclamation" /> No backup policies
                                    {:else}
                                        {description}
                                    {/if}
                                </span>
                            </Cell>
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

<style lang="scss">
    .icon-exclamation {
        color: hsl(var(--color-warning-100)) !important;
    }
</style>
