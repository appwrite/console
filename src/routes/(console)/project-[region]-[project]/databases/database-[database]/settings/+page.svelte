<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { BoxAvatar, CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, Helper, InputText } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import Delete from '../delete.svelte';
    import { Query } from '@appwrite.io/console';
    import { Layout, Skeleton } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { getTerminologies } from '$database/(entity)';
    import UpdateName from './updateName.svelte';
    import UpdateTier from './updateTier.svelte';
    import UpdateStorage from './updateStorage.svelte';
    import UpdateNetwork from './updateNetwork.svelte';
    import UpdateMaintenance from './updateMaintenance.svelte';
    import UpdateBackups from './updateBackups.svelte';
    import UpdateAutoscaling from './updateAutoscaling.svelte';
    import UpdatePooler from './updatePooler.svelte';
    import UpdateExtensions from './updateExtensions.svelte';
    import UpgradeVersion from './upgradeVersion.svelte';
    import UpdateReadReplicas from './updateReadReplicas.svelte';
    import UpdateCrossRegion from './updateCrossRegion.svelte';
    import UpdateHAStatus from './updateHAStatus.svelte';
    import UpdateBackupStorage from './updateBackupStorage.svelte';
    import UpdateSqlApi from './updateSqlApi.svelte';
    import DangerZone from './dangerZone.svelte';

    const data = page.data;

    const database = $derived(data.database);
    const dedicatedDatabase = $derived(data.dedicatedDatabase as Models.DedicatedDatabase | null);

    const isDedicatedType = $derived(dedicatedDatabase !== null && database.type === 'dedicateddb');

    const isDedicated = $derived(isDedicatedType);
    const isShared = $derived(false);
    const isPostgres = $derived(dedicatedDatabase?.engine === 'postgres');

    // Legacy database fallback state
    let showDelete = $state(false);
    let databaseName: string | null = $state(null);
    let errorMessage: string = $state('Something went wrong');
    let errorType: 'error' | 'warning' | 'success' = $state('error');
    let showError: false | 'name' | 'email' | 'password' = $state(false);

    const { databaseSdk, terminology } = getTerminologies();

    onMount(async () => {
        databaseName ??= database.name;
    });

    async function loadEntityCount() {
        const { total } = await databaseSdk.listEntities({
            databaseId: page.params.database,
            queries: [Query.limit(1)]
        });

        return total;
    }

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        errorType = type;
        showError = location;
        errorMessage = message;
    }

    async function updateName() {
        try {
            await sdk.forProject(page.params.region, page.params.project).tablesDB.update({
                databaseId: page.params.database,
                name: databaseName
            });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateName);
        } catch (error) {
            addError('name', error.message, 'error');
            trackError(error, Submit.DatabaseUpdateName);
        }
    }
</script>

{#if isDedicatedType && dedicatedDatabase}
    <!-- Dedicated / Shared database settings -->
    <Container>
        <CardGrid>
            <svelte:fragment slot="title">{dedicatedDatabase.name}</svelte:fragment>
            <svelte:fragment slot="aside">
                <div class="grid-1-2-col-2">
                    <p>Created: {toLocaleDateTime(dedicatedDatabase.$createdAt)}</p>
                    <p>Last updated: {toLocaleDateTime(dedicatedDatabase.$updatedAt)}</p>
                </div>
            </svelte:fragment>
        </CardGrid>

        <!-- 1. Rename Database - all types -->
        <UpdateName database={dedicatedDatabase} />

        <!-- 2. Resource Scaling - dedicated only -->
        {#if isDedicated}
            <UpdateTier database={dedicatedDatabase} />
        {/if}

        <!-- 3. Storage Resize - dedicated and shared -->
        {#if isDedicated || isShared}
            <UpdateStorage database={dedicatedDatabase} />
        {/if}

        <!-- 4. Network Settings -->
        <UpdateNetwork database={dedicatedDatabase} />

        <!-- 5. Maintenance Window - dedicated and shared -->
        {#if isDedicated || isShared}
            <UpdateMaintenance database={dedicatedDatabase} />
        {/if}

        <!-- 6. Backup Settings - all types -->
        <UpdateBackups database={dedicatedDatabase} />

        <!-- 7. Storage Autoscaling - dedicated and shared -->
        {#if isDedicated || isShared}
            <UpdateAutoscaling database={dedicatedDatabase} />
        {/if}

        <!-- 8. Connection Pooler - PostgreSQL only -->
        {#if isPostgres}
            <UpdatePooler database={dedicatedDatabase} />
        {/if}

        <!-- 9. Extensions - PostgreSQL only -->
        {#if isPostgres}
            <UpdateExtensions database={dedicatedDatabase} />
        {/if}

        <!-- 10. Version Upgrade - dedicated and shared -->
        {#if isDedicated || isShared}
            <UpgradeVersion database={dedicatedDatabase} />
        {/if}

        <!-- 13. Read Replicas - dedicated only -->
        {#if isDedicated}
            <UpdateReadReplicas database={dedicatedDatabase} />
        {/if}

        <!-- 14. Cross-Region Failover - dedicated only -->
        {#if isDedicated}
            <UpdateCrossRegion database={dedicatedDatabase} />
        {/if}

        <!-- 15. High Availability -->
        <UpdateHAStatus database={dedicatedDatabase} />

        <!-- 16. Backup Storage - dedicated only -->
        {#if isDedicated}
            <UpdateBackupStorage database={dedicatedDatabase} />
        {/if}

        <!-- 17. SQL API -->
        <UpdateSqlApi database={dedicatedDatabase} />

        <!-- 18. Delete Database - all types -->
        <DangerZone database={dedicatedDatabase} />
    </Container>
{:else if database}
    <!-- Legacy / tablesdb / documentsdb settings -->
    <Container databasesMainScreen>
        <CardGrid>
            <svelte:fragment slot="title">{database.name}</svelte:fragment>
            <svelte:fragment slot="aside">
                <div class="grid-1-2-col-2">
                    <p>Created: {toLocaleDateTime(database.$createdAt)}</p>
                    <p>Last updated: {toLocaleDateTime(database.$updatedAt)}</p>
                </div>
            </svelte:fragment>
        </CardGrid>

        <Form onSubmit={updateName}>
            <CardGrid>
                <svelte:fragment slot="title">Name</svelte:fragment>
                <svelte:fragment slot="aside">
                    <ul>
                        <InputText
                            id="name"
                            label="Name"
                            placeholder="Enter database name"
                            autocomplete={false}
                            bind:value={databaseName}
                            required />
                        {#if showError === 'name'}
                            <Helper type={errorType}>{errorMessage}</Helper>
                        {/if}
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={databaseName === database.name || !databaseName} submit
                        >Update
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid>
            <svelte:fragment slot="title">Delete database</svelte:fragment>
            The database will be permanently deleted, including all {terminology.entity.lower
                .plural} within it. This action is irreversible.
            <svelte:fragment slot="aside">
                <BoxAvatar>
                    <svelte:fragment slot="title">
                        <Layout.Stack direction="column" gap="xxs">
                            <h6 class="u-bold u-trim-1">{database.name}</h6>
                            <Layout.Stack direction="row" gap="s">
                                {#await loadEntityCount()}
                                    <Skeleton variant="line" width="100%" height={19.5} />
                                {:then count}
                                    {@const entity = terminology.entity.title}
                                    {count}
                                    {count === 1 ? entity.singular : entity.plural}
                                {/await}
                            </Layout.Stack>
                        </Layout.Stack>
                    </svelte:fragment>
                </BoxAvatar>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    secondary
                    on:click={() => {
                        showDelete = true;
                        trackEvent(Click.DatabaseDatabaseDelete);
                    }}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    </Container>
    <Delete bind:showDelete />
{/if}
