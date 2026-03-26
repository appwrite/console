<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { writable } from 'svelte/store';
    import { Form, InputText, InputSelect, InputCheckbox, Button } from '$lib/elements/forms';
    import {
        Alert,
        Card,
        Divider,
        Fieldset,
        Icon,
        Layout,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { resolveRoute } from '$lib/stores/navigation';
    import { afterNavigate, goto } from '$app/navigation';
    import { CustomId } from '$lib/components';
    import { page } from '$app/state';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { ID, type Models } from '@appwrite.io/console';
    import {
        type DatabaseType,
        type DedicatedDatabaseParams,
        useDatabaseSdk
    } from '$database/(entity)';
    import { isCloud } from '$lib/system';
    import { getChangePlanUrl } from '$lib/stores/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { currentPlan } from '$lib/stores/organization';
    import EmptyDarkMobile from '$lib/images/backups/upgrade/backups-mobile-dark.png';
    import EmptyLightMobile from '$lib/images/backups/upgrade/backups-mobile-light.png';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import CreatePolicy from '$database/backups/createPolicy.svelte';
    import { cronExpression, type UserBackupPolicy } from '$lib/helpers/backups';

    import Mongo from '../(assets)/mongo.svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { filterRegions } from '$lib/helpers/regions';
    import { regions as regionsStore } from '$lib/stores/organization';
    import { backupRetainingOptions } from '$database/store';
    import PolicyPresets from '$database/backups/policyPresets.svelte';

    let formComponent: Form;

    let databaseId = $state(params.get('id') ?? null);
    let databaseName = $state(params.get('name') ?? null);

    let showCreatePolicies = $state(false);
    let totalPolicies: UserBackupPolicy[] = $state([]);

    let showCustomId = $state(false);
    let showExitModal = $state(false);
    let isSubmitting = $state(writable(false));
    let previousPage: string = $state(resolveRoute('/'));

    const params = page.url.searchParams;
    const typeFromParams = params.get('type') ?? (null as DatabaseType);
    let type = $state(typeFromParams ?? 'tablesdb') as DatabaseType;

    const isDark = $derived($app.themeInUse === 'dark');
    const backupsImg = $derived(isDark ? EmptyDarkMobile : EmptyLightMobile);

    // Free tier limits for shared databases
    const sharedTierLimits = {
        ram: '128 MB',
        cpu: '0.125 vCPU',
        storage: '1 GB',
        maxConnections: 10,
        queryTimeout: '15s',
        idleTimeout: '15 min'
    };

    const databaseTypes: Array<{
        type: DatabaseType;
        title: string;
        subtitle: string;
        icon?: typeof Mongo;
    }> = [
        {
            type: 'tablesdb',
            title: 'TablesDB',
            subtitle:
                'Structure your data in rows and columns. Best for relational data and advanced querying.'
        },
        {
            type: 'documentsdb',
            title: 'DocumentsDB',
            subtitle:
                'Store flexible data without a fixed schema. Best for unstructured data and simple querying.',
            icon: Mongo
        },
        {
            type: 'shared',
            title: 'Shared (Free)',
            subtitle:
                'Free serverless PostgreSQL that scales to zero when idle. Great for prototyping and small projects.'
        },
        {
            type: 'dedicated',
            title: 'DedicatedDB',
            subtitle:
                'Always-on dedicated instances with high availability. Best for production workloads.'
        }
    ];

    // Dedicated DB specific options
    const engineOptions = [
        { value: 'postgres', label: 'PostgreSQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'mariadb', label: 'MariaDB' },
        { value: 'mongodb', label: 'MongoDB' }
    ];

    const regionOptions = $derived(filterRegions($regionsStore.regions || []));

    const tiers: Record<string, { label: string; price: number }> = {
        'free': { label: 'Free - 0.125 vCPU, 128MB RAM', price: 0 },
        's-1vcpu-1gb': { label: 'Starter - 1 vCPU, 1GB RAM', price: 15 },
        's-2vcpu-2gb': { label: 'Standard - 2 vCPU, 2GB RAM', price: 30 },
        's-2vcpu-4gb': { label: 'Standard Plus - 2 vCPU, 4GB RAM', price: 60 },
        's-4vcpu-8gb': { label: 'Professional - 4 vCPU, 8GB RAM', price: 100 },
        's-4vcpu-16gb': { label: 'Business - 4 vCPU, 16GB RAM', price: 190 },
        's-4vcpu-32gb': { label: 'Business Plus - 4 vCPU, 32GB RAM', price: 370 },
        's-8vcpu-32gb': { label: 'Enterprise - 8 vCPU, 32GB RAM', price: 620 },
        's-8vcpu-64gb': { label: 'Enterprise Plus - 8 vCPU, 64GB RAM', price: 860 }
    };

    const tierOptions = Object.entries(tiers).map(([value, { label, price }]) => ({
        value,
        label: `${label} - $${price}/mo`
    }));

    // State for dedicated options (pre-populated from URL params)
    let selectedEngine = $state(params.get('engine') ?? 'postgres');
    let selectedRegion = $state<string | null>(params.get('region') ?? null);
    let selectedTier = $state(params.get('tier') ?? 'free');

    // Set default region when regions load
    $effect(() => {
        if (!selectedRegion && regionOptions.length > 0) {
            const firstEnabled = regionOptions.find((r) => !r.disabled);
            selectedRegion = firstEnabled?.value ?? regionOptions[0].value;
        }
    });
    let highAvailability = $state(params.get('ha') === 'true');

    // Helper to check database type capabilities
    const showRegionSelect = $derived(type === 'dedicated' || type === 'shared');
    const showTierSelect = $derived(type === 'dedicated');
    const showEngineSelect = $derived(type === 'dedicated');
    const isSharedType = $derived(type === 'shared');
    const isFreeTier = $derived(selectedTier === 'free');

    // Free tier disables HA, backups, and PITR
    $effect(() => {
        if (isFreeTier) {
            highAvailability = false;
            selectedBackupPolicy = 'none';
            backupPitr = false;
        }
    });

    const tierPrice = $derived(tiers[selectedTier]?.price ?? 0);
    const estimatedMonthly = $derived(tierPrice * (highAvailability ? 2 : 1));

    // Backup system varies by database type
    const backupSystem = $derived.by(() => {
        switch (type) {
            case 'tablesdb':
            case 'documentsdb':
                return 'appwrite';
            case 'shared':
                return 'shared';
            case 'dedicated':
                return 'dedicated';
            default:
                return 'appwrite';
        }
    });

    // DedicatedDB backup options
    const dedicatedBackupPresets = [
        {
            id: 'daily',
            label: 'Daily',
            description: 'Backup every day, retained for 7 days',
            schedule: '0 0 * * *',
            retained: 7
        },
        {
            id: 'hourly',
            label: 'Hourly',
            description: 'Backup every hour, retained for 24 hours',
            schedule: '0 * * * *',
            retained: 1
        },
        {
            id: 'none',
            label: 'No backup',
            description: 'Skip backups. You can change this later'
        }
    ];

    let selectedBackupPolicy = $state<string>(params.get('backup') ?? 'daily');
    let backupRetentionDays = $state(Number(params.get('retention')) || 7);
    let backupPitr = $state(params.get('pitr') === 'true');
    let pitrRetentionDays = $state(7);

    // Derive backup settings from selected policy
    const backupEnabled = $derived(selectedBackupPolicy !== 'none');
    const selectedBackupSchedule = $derived.by(() => {
        const policy = dedicatedBackupPresets.find((p) => p.id === selectedBackupPolicy);
        return policy?.schedule ?? '0 0 * * *';
    });

    // Filter retention options (exclude Forever and Custom for dedicated DBs)
    const dedicatedRetentionOptions = backupRetainingOptions.filter(
        (opt) => opt.value > 0 && opt.value <= 365
    );

    afterNavigate(({ from }) => (previousPage = from?.url?.pathname || previousPage));

    function trackPolicyEvents() {
        totalPolicies.forEach((policy: UserBackupPolicy) => {
            let actualDay = null;
            const monthlyBackupFrequency = policy.monthlyBackupFrequency;
            switch (monthlyBackupFrequency) {
                case 'first':
                    actualDay = '1st';
                    break;
                case 'middle':
                    actualDay = '15th';
                    break;
                case 'end':
                default:
                    actualDay = '28th';
                    break;
            }

            const message = {
                keepFor: `${policy.retained} days`,
                frequency: policy.plainTextFrequency,
                policy: policy.default ? 'preset' : 'custom'
            };

            if (actualDay) {
                message['monthlyInterval'] = actualDay;
            }

            trackEvent('submit_policy_submit', message);
        });

        totalPolicies = [];
    }

    async function createPolicies(resourceId: string) {
        if (!totalPolicies.length) return;

        const totalPoliciesPromise = totalPolicies.map((policy) => {
            cronExpression(policy);

            return sdk.forProject(page.params.region, page.params.project).backups.createPolicy({
                policyId: ID.unique(),
                services: ['databases'],
                retention: policy.retained,
                schedule: policy.schedule,
                name: policy.label,
                resourceId
            });
        });

        await Promise.all(totalPoliciesPromise);
        trackPolicyEvents();
    }

    async function createDatabase() {
        try {
            databaseId ??= ID.unique();

            let database: Models.Database;
            const databaseSdk = useDatabaseSdk(page.params.region, page.params.project);

            if (type === 'shared') {
                database = await databaseSdk.create(type, {
                    databaseId,
                    name: databaseName,
                    region: selectedRegion
                } as DedicatedDatabaseParams);
            } else if (type === 'dedicated') {
                database = await databaseSdk.create(type, {
                    databaseId,
                    name: databaseName,
                    engine: selectedEngine,
                    region: selectedRegion,
                    tier: selectedTier,
                    highAvailability,
                    backupEnabled,
                    backupSchedule: backupEnabled ? selectedBackupSchedule : undefined,
                    backupRetentionDays: backupEnabled ? backupRetentionDays : undefined,
                    backupPitr: backupEnabled ? backupPitr : undefined,
                    pitrRetentionDays: backupEnabled && backupPitr ? pitrRetentionDays : undefined
                } as DedicatedDatabaseParams);
            } else {
                database = await databaseSdk.create(type, {
                    databaseId,
                    name: databaseName
                });
                // Create Appwrite backup policies for TablesDB/DocumentsDB
                await createPolicies(database.$id);
            }

            addNotification({
                type: 'success',
                message: `${database.name} has been created`
            });

            // goto the database id
            await goto(
                resolveRoute(
                    '/(console)/project-[region]-[project]/databases/database-[database]',
                    {
                        ...page.params,
                        database: database.$id
                    }
                )
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseCreate);
        }
    }
</script>

<Wizard
    title="Create database"
    href={previousPage}
    bind:showExitModal
    confirmExit
    column
    columnSize="s">
    <Form bind:this={formComponent} onSubmit={createDatabase} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            {#if typeFromParams === null}
                <Fieldset legend="Database type">
                    {@render selectDatabaseType()}
                </Fieldset>
            {/if}

            <Fieldset legend="Details">
                <Layout.Stack direction="column" gap="l">
                    <InputText
                        required
                        id="name"
                        autofocus
                        label="Name"
                        bind:value={databaseName}
                        placeholder="Enter database name" />

                    {#if !showCustomId}
                        <div>
                            <Tag size="s" on:click={() => (showCustomId = true)}>
                                <Icon icon={IconPencil} slot="start" size="s" />
                                Database ID
                            </Tag>
                        </div>
                    {/if}

                    <CustomId bind:show={showCustomId} name="Database" bind:id={databaseId} />
                </Layout.Stack>
            </Fieldset>

            {#if showRegionSelect}
                <Fieldset legend="Configuration">
                    <Layout.Stack direction="column" gap="l">
                        {#if showEngineSelect}
                            <InputSelect
                                id="engine"
                                label="Database Engine"
                                bind:value={selectedEngine}
                                options={engineOptions} />
                        {/if}

                        <InputSelect
                            id="region"
                            label="Region"
                            bind:value={selectedRegion}
                            options={regionOptions} />

                        {#if showTierSelect}
                            <InputSelect
                                id="tier"
                                label="Resource Tier"
                                bind:value={selectedTier}
                                options={tierOptions} />

                            <InputCheckbox
                                id="ha"
                                label="Enable High Availability"
                                bind:checked={highAvailability}
                                disabled={isFreeTier}
                                description={isFreeTier
                                    ? 'Upgrade to a paid tier to enable high availability'
                                    : 'Deploy a standby replica for automatic failover (doubles cost)'} />
                        {/if}
                    </Layout.Stack>
                </Fieldset>

                <Fieldset legend="Estimated cost">
                    <Card.Base padding="s">
                        <Layout.Stack>
                            <Layout.Stack direction="row" justifyContent="space-between">
                                <Typography.Text variant="m-400">
                                    {tiers[selectedTier]?.label ?? 'Database'}
                                </Typography.Text>
                                <Typography.Text variant="m-400">
                                    {formatCurrency(tierPrice)}/mo
                                </Typography.Text>
                            </Layout.Stack>
                            {#if highAvailability}
                                <Layout.Stack direction="row" justifyContent="space-between">
                                    <Typography.Text variant="m-400">
                                        High availability replica
                                    </Typography.Text>
                                    <Typography.Text variant="m-400">
                                        {formatCurrency(tierPrice)}/mo
                                    </Typography.Text>
                                </Layout.Stack>
                            {/if}

                            <Divider />
                            <Layout.Stack direction="row" justifyContent="space-between">
                                <Typography.Text>Estimated total</Typography.Text>
                                <Typography.Text>
                                    {formatCurrency(estimatedMonthly)}/mo
                                </Typography.Text>
                            </Layout.Stack>

                            <Typography.Text>
                                You'll be charged <b>{formatCurrency(estimatedMonthly)}</b> every
                                30 days. Costs may vary with storage and network usage.
                            </Typography.Text>
                        </Layout.Stack>
                    </Card.Base>
                </Fieldset>
            {/if}

            {#if isSharedType}
                <Fieldset legend="Free tier limits">
                    <Alert.Inline status="info" title="Shared database limits">
                        Shared databases are free and scale to zero when idle. The following
                        limits apply:
                    </Alert.Inline>
                    <Layout.Grid columns={2} columnsS={1} gap="l">
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                RAM
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {sharedTierLimits.ram}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                CPU
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {sharedTierLimits.cpu}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Storage
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {sharedTierLimits.storage}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Max Connections
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {sharedTierLimits.maxConnections}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Query Timeout
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {sharedTierLimits.queryTimeout}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xxs">
                            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                                Idle Timeout
                            </Typography.Caption>
                            <Typography.Text variant="m-500">
                                {sharedTierLimits.idleTimeout} (scales to zero)
                            </Typography.Text>
                        </Layout.Stack>
                    </Layout.Grid>
                </Fieldset>
            {/if}

            <Fieldset legend="Backups">
                {#if backupSystem === 'appwrite'}
                    {#if isCloud}
                        {@render cloudBackupOptions()}
                    {:else}
                        {@render selfHostedBackupOptions()}
                    {/if}
                {:else if backupSystem === 'shared'}
                    {@render sharedBackupOptions()}
                {:else if backupSystem === 'dedicated'}
                    {@render dedicatedBackupOptions()}
                {/if}
            </Fieldset>
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button
            secondary
            fullWidthMobile
            disabled={$isSubmitting}
            on:click={() => (showExitModal = true)}>
            Cancel
        </Button>
        <Button
            fullWidthMobile
            disabled={$isSubmitting}
            on:click={() => formComponent.triggerSubmit()}>
            {type === 'dedicated' ? `Create - ${formatCurrency(estimatedMonthly)}/mo` : 'Create'}
        </Button>
    </svelte:fragment>
</Wizard>

{#snippet cloudBackupOptions()}
    {#if $currentPlan?.backupsEnabled}
        <div style:width="100%">
            <CreatePolicy
                bind:totalPolicies
                title="Backup policies"
                bind:isShowing={showCreatePolicies}
                subtitle="Protect your data and ensure quick recovery by adding backup policies."
                project={page.data.project} />
        </div>
    {:else}
        <Alert.Inline title="This database won't be backed up" status="warning">
            Upgrade your plan to ensure your data stays safe and backed up.
            <svelte:fragment slot="actions">
                <Button compact href={getChangePlanUrl()}>Upgrade plan</Button>
            </svelte:fragment>
        </Alert.Inline>
    {/if}
{/snippet}

{#snippet selfHostedBackupOptions()}
    <Layout.Stack gap="xl" style="position: relative;">
        <Layout.Stack direction={!$isTabletViewport ? 'row' : 'column'}>
            <img src={backupsImg} style:width="100vw" class="backups-promo" alt="Backups promo" />

            <Layout.Stack gap="l">
                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-600">
                        Backups are available on Appwrite Cloud
                    </Typography.Text>

                    <Typography.Text>
                        Sign up to access backups. Schedule automatic or manual backups to protect
                        your data and ensure quick recovery.
                    </Typography.Text>
                </Layout.Stack>

                <Layout.Stack inline alignItems="flex-start">
                    <Button
                        external
                        secondary
                        fullWidthMobile
                        href="https://cloud.appwrite.io/register">
                        Sign up to Cloud
                    </Button>
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>
{/snippet}

{#snippet sharedBackupOptions()}
    <Layout.Stack gap="l">
        <Alert.Inline status="info" title="No backups on free tier">
            Shared databases on the free tier do not include automatic backups. Upgrade to a
            dedicated database for configurable backup and point-in-time recovery options.
        </Alert.Inline>
    </Layout.Stack>
{/snippet}

{#snippet dedicatedBackupOptions()}
    <Layout.Stack gap="l">
        {#if isFreeTier}
            <Alert.Inline status="info" title="Backups unavailable on free tier">
                Upgrade to a paid tier to enable automatic backups and point-in-time recovery.
            </Alert.Inline>
        {:else}
            <PolicyPresets
                policies={dedicatedBackupPresets}
                bind:selected={selectedBackupPolicy}
                columns={3} />

            {#if backupEnabled}
                <InputSelect
                    id="backupRetention"
                    label="Retention period"
                    bind:value={backupRetentionDays}
                    options={dedicatedRetentionOptions} />

                <InputCheckbox
                    id="backupPitr"
                    label="Enable Point-in-Time Recovery (PITR)"
                    bind:checked={backupPitr}
                    description="Restore your database to any point within the retention window" />

                {#if backupPitr}
                    <InputSelect
                        id="pitrRetention"
                        label="PITR retention window"
                        bind:value={pitrRetentionDays}
                        options={[
                            { value: 1, label: '1 day' },
                            { value: 3, label: '3 days' },
                            { value: 7, label: '7 days' },
                            { value: 14, label: '14 days' },
                            { value: 21, label: '21 days' },
                            { value: 28, label: '28 days' },
                            { value: 35, label: '35 days (max)' }
                        ]} />

                    <Alert.Inline status="info" title="Point-in-Time Recovery">
                        PITR allows you to restore your database to any point within the {pitrRetentionDays}-day
                        retention window using WAL archiving. This provides more granular recovery
                        options but increases storage usage.
                    </Alert.Inline>
                {/if}
            {/if}
        {/if}
    </Layout.Stack>
{/snippet}

{#snippet selectDatabaseType()}
    <Layout.Grid columns={2} columnsS={1}>
        {#each databaseTypes as databaseType}
            <div class="card-selector">
                <Card.Selector
                    variant="secondary"
                    bind:group={type}
                    name={databaseType.type}
                    id={databaseType.type}
                    value={databaseType.type}
                    title={databaseType.title}
                    imageRadius="s"
                    icon={databaseType.icon}>
                    {databaseType.subtitle}
                </Card.Selector>
            </div>
        {/each}
    </Layout.Grid>
{/snippet}

<style lang="scss">
    :global(img.backups-promo) {
        width: 220px !important;

        @media (max-width: 768px) {
            width: 100% !important;
            height: unset !important;
        }
    }

    :global(.card-selector) {
        & :global(div:has(p:first-child)) {
            /* make the title take only fitting space so the icon is beside it */
            width: fit-content;
        }

        & :global(i:has(.custom-tag)) {
            /* fitting space for tag and icon */
            width: unset;
        }
    }
</style>
