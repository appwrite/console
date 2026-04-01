<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Confirm } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { TargetType, type Models } from '@appwrite.io/console';
    import { Alert, Badge, Layout, Typography } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    const currentType = $derived(database.type === 'dedicateddb' ? 'Dedicated' : 'Shared');
    const targetType = $derived(
        database.type === 'dedicateddb' ? TargetType.Shared : TargetType.Dedicated
    );
    const targetLabel = $derived(database.type === 'dedicateddb' ? 'Shared' : 'Dedicated');

    let showConfirm = $state(false);

    async function migrateDatabase() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .compute.createDatabaseMigration({
                    databaseId: database.$id,
                    targetType
                });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: `Database migration to ${targetLabel} started`,
                type: 'success'
            });

            trackEvent(Submit.DedicatedDatabaseMigrate);
            showConfirm = false;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DedicatedDatabaseMigrate);
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Migrate Database Type</svelte:fragment>
    Migrate your database between shared and dedicated types. Data is preserved during migration.
    <svelte:fragment slot="aside">
        <Layout.Stack gap="l">
            <Layout.Grid columns={2} columnsS={1} gap="l">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Current Type
                    </Typography.Caption>
                    <Badge variant="secondary" size="s" content={currentType} />
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Target Type
                    </Typography.Caption>
                    <Badge variant="secondary" size="s" content={targetLabel} />
                </Layout.Stack>
            </Layout.Grid>
            <Alert.Inline status="info" title="Migration details">
                {#if database.type === 'dedicateddb'}
                    Migrating to shared converts your database to a serverless pod that scales to
                    zero when idle, reducing costs for low-traffic workloads.
                {:else}
                    Migrating to dedicated creates an always-on StatefulSet with external access and
                    persistent resources for production workloads.
                {/if}
            </Alert.Inline>
        </Layout.Stack>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showConfirm = true)}>
            Migrate to {targetLabel}
        </Button>
    </svelte:fragment>
</CardGrid>

<Confirm title="Migrate database" bind:open={showConfirm} onSubmit={migrateDatabase}>
    <Layout.Stack gap="l">
        <Typography.Text>
            Are you sure you want to migrate this database from <strong>{currentType}</strong> to
            <strong>{targetLabel}</strong>?
        </Typography.Text>
        <Alert.Inline status="warning" title="Downtime expected">
            Your database will be temporarily unavailable during migration. Data will be preserved.
        </Alert.Inline>
    </Layout.Stack>
</Confirm>
