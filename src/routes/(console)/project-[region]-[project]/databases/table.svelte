<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { columns } from './store';
    import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Tooltip, Table, Icon } from '@appwrite.io/pink-svelte';
    import { type Models } from '@appwrite.io/console';

    let {
        tables,
        policies,
        databases,
        lastBackups
    }: {
        tables: Record<string, string>;
        databases: Models.DatabaseList;
        lastBackups: Record<string, string>;
        policies: Record<string, Models.BackupPolicy[]>;
    } = $props();

    function getPolicyDescription(cron: string): string {
        const [minute, hour, dayOfMonth, , dayOfWeek] = cron.split(' ');

        if (dayOfMonth !== '*') return 'Monthly';
        if (dayOfWeek !== '*') return 'Weekly on Mondays';
        if (minute !== '*' && hour === '*') return 'Hourly';
        if (hour !== '*') return 'Daily';
    }

    function getPoliciesDescription(policies: Models.BackupPolicy[] | null): string {
        return policies?.map((policy) => getPolicyDescription(policy.schedule)).join(', ') ?? '';
    }
</script>

<Table.Root columns={$columns} let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
        {/each}
    </svelte:fragment>
    {#each databases.databases as database (database.$id)}
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
                        {@const backupPolicies = policies?.[database.$id] ?? null}
                        {@const lastBackup = lastBackups?.[database.$id] ?? null}
                        {@const description = getPoliciesDescription(backupPolicies)}

                        <Tooltip
                            placement="bottom"
                            disabled={!backupPolicies || !lastBackup}
                            maxWidth="fit-content">
                            <span class="u-trim">
                                {#if !backupPolicies}
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
                    {:else if column.type === 'datetime'}
                        <DualTimeView time={database[column.id]} showDatetime />
                    {:else}
                        {database[column.id]}
                    {/if}
                </Table.Cell>
            {/each}
        </Table.Row.Link>
    {/each}
</Table.Root>
