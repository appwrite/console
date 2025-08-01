<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { columns } from './store';
    import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Tooltip, Table, Icon } from '@appwrite.io/pink-svelte';
    import type { BackupPolicy } from '$lib/sdk/backups';

    export let data;
    const tables = data.tables;

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
        <!-- takes directly to the spreadsheet -->
        {@const tableId = tables[database?.$id] ?? null}
        {@const tableHref = tableId ? `/table-${tableId}` : ''}
        <Table.Row.Link
            {root}
            href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${database.$id}${tableHref}`}>
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
                            ?.map((policy: BackupPolicy) => getPolicyDescription(policy.schedule))
                            .join(', ')}

                        <Tooltip
                            placement="bottom"
                            disabled={!policies || !lastBackup}
                            maxWidth="fit-content">
                            <span class="u-trim">
                                {#if !policies}
                                    <Layout.Stack direction="row" gap="xxs" alignItems="center">
                                        <Icon
                                            icon={IconExclamation}
                                            size="s"
                                            color="--bgcolor-warning" />
                                        No backup policies
                                    </Layout.Stack>
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
