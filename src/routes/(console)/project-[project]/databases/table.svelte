<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { Tooltip, Table } from '@appwrite.io/pink-svelte';

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

<Table.Root>
    <svelte:fragment slot="header">
        {#each $columns as column}
            {#if column.show}
                <Table.Header.Cell width={column.width.toString()}>{column.title}</Table.Header.Cell>
            {/if}
        {/each}
    </svelte:fragment>
    {#each data.databases.databases as database (database.$id)}
        <Table.Link href={`${base}/project-${projectId}/databases/database-${database.$id}`}>
            {#each $columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Table.Cell width={column.width + 'px'}>
                                <Id value={database.$id}>
                                    {database.$id}
                                </Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === 'name'}
                        <Table.Cell width={column.width + 'px'}>
                            {database.name}
                        </Table.Cell>
                    {:else if column.id === 'backup'}
                        {@const policies = data.policies?.[database.$id] ?? null}
                        {@const lastBackup = data.lastBackups?.[database.$id] ?? null}
                        {@const description = policies
                            ?.map((policy) => getPolicyDescription(policy.schedule))
                            .join(', ')}

                        <Table.Cell width={column.width + 'px'}>
                            <Tooltip placement="bottom" disabled={!policies || !lastBackup}>
                                <span class="u-trim">
                                    {#if !policies}
                                        <span class="icon-exclamation" /> No backup policies
                                    {:else}
                                        {description}
                                    {/if}
                                </span>
                                <span slot="tooltip">{`Last backup: ${lastBackup}`}</span>
                            </Tooltip>
                        </Table.Cell>
                    {:else}
                        <Table.Cell width={column.width + 'px'}>
                            {toLocaleDateTime(database[column.id])}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
        </Table.Link>
    {/each}
</Table.Root>

<style lang="scss">
    .icon-exclamation {
        color: hsl(var(--color-warning-100)) !important;
    }
</style>
