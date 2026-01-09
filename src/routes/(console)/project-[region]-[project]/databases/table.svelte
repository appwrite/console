<script lang="ts">
    import { page } from '$app/state';
    import { columns, getDatabaseTypeTitle } from './store';
    import { Id } from '$lib/components';
    import type { Models } from '@appwrite.io/console';
    import { useTerminology } from '$database/(entity)';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Tooltip, Table, Icon } from '@appwrite.io/pink-svelte';

    let {
        entities,
        policies,
        databases,
        lastBackups
    }: {
        entities: Record<string, string>;
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

    function getEntityUrl(database: Models.Database, entityId: string) {
        const terminology = useTerminology(database.type);
        const entityType = terminology.entity.lower.singular;

        return withPath(
            resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', {
                ...page.params,
                database: database.$id
            }),
            entityId ? `/${entityType}-${entityId}` : ''
        );
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
        {@const entityId = entities[database?.$id] ?? null}
        <Table.Row.Link {root} href={getEntityUrl(database, entityId)}>
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
                    {:else if column.id === 'type'}
                        {getDatabaseTypeTitle(database)}
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
