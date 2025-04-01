<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { Tooltip, Table } from '@appwrite.io/pink-svelte';

    export let data: PageData;
    const projectId = page.params.project;

    function getPolicyDescription(cron: string): string {
        const [minute, hour, dayOfMonth, , dayOfWeek] = cron.split(' ');

        if (dayOfMonth !== '*') return 'Monthly';
        if (dayOfWeek !== '*') return 'Weekly on Mondays';
        if (minute !== '*' && hour === '*') return 'Hourly';
        if (hour !== '*') return 'Daily';
    }
</script>

<Table.Root columns={$columns} let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each data.databases.databases as database (database.$id)}
        <Table.Row.Link
            {root}
            href={`${base}/project-${projectId}/databases/database-${database.$id}`}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key $columns}
                            <Id value={database.$id}>
                                {database.$id}
                            </Id>
                        {/key}
                    {:else if column.id === 'name'}
                        {database.name}
                    {:else if column.id === 'backup'}
                        {@const policies = data.policies?.[database.$id] ?? null}
                        {@const lastBackup = data.lastBackups?.[database.$id] ?? null}
                        {@const description = policies
                            ?.map((policy) => getPolicyDescription(policy.schedule))
                            .join(', ')}

                        <Tooltip
                            placement="bottom"
                            disabled={!policies || !lastBackup}
                            maxWidth="fit-content">
                            <span class="u-trim">
                                {#if !policies}
                                    <span class="icon-exclamation"></span> No backup policies
                                {:else}
                                    {description}
                                {/if}
                            </span>
                            <span slot="tooltip">
                                {`Last backup: ${lastBackup}`}
                            </span>
                        </Tooltip>
                    {:else}
                        {toLocaleDateTime(database[column.id])}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Link>
    {/each}
</Table.Root>
