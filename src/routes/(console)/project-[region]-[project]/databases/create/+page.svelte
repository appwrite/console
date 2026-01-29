<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { writable } from 'svelte/store';
    import { Form, InputText, InputSelect, InputCheckbox, Button } from '$lib/elements/forms';
    import { Alert, Card, Fieldset, Icon, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
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
    import { upgradeURL } from '$lib/stores/billing';
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

    let databaseId = $state(null);
    let databaseName = $state(null);

    let showCreatePolicies = $state(false);
    let totalPolicies: UserBackupPolicy[] = $state([]);

    let showCustomId = $state(false);
    let showExitModal = $state(false);
    let isSubmitting = $state(writable(false));
    let previousPage: string = $state(resolveRoute('/'));

    const typeFromParams = page.url.searchParams.get('type') ?? (null as DatabaseType);
    let type = $state(typeFromParams ?? 'tablesdb') as DatabaseType;

    const isDark = $derived($app.themeInUse === 'dark');
    const backupsImg = $derived(isDark ? EmptyDarkMobile : EmptyLightMobile);

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
            type: 'prisma',
            title: 'Prisma Postgres',
            subtitle:
                'Managed PostgreSQL with direct connections. Best for high-performance SQL workloads.'
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
        { value: 'mariadb', label: 'MariaDB' }
    ];

    const regionOptions = $derived(filterRegions($regionsStore.regions || []));

    const tierOptions = [
        { value: 'starter', label: 'Starter - 0.5 CPU, 512MB RAM, 10GB Storage' },
        { value: 'standard', label: 'Standard - 1 CPU, 2GB RAM, 50GB Storage' },
        { value: 'professional', label: 'Professional - 2 CPU, 4GB RAM, 100GB Storage' },
        { value: 'enterprise', label: 'Enterprise - 4 CPU, 8GB RAM, 250GB Storage' }
    ];

    // State for dedicated/prisma options
    let selectedEngine = $state('postgres');
    let selectedRegion = $state<string | null>(null);
    let selectedTier = $state('starter');

    // Set default region when regions load
    $effect(() => {
        if (!selectedRegion && regionOptions.length > 0) {
            const firstEnabled = regionOptions.find((r) => !r.disabled);
            selectedRegion = firstEnabled?.value ?? regionOptions[0].value;
        }
    });
    let highAvailability = $state(false);

    // Helper to check database type capabilities
    const showRegionSelect = $derived(type === 'prisma' || type === 'dedicated');
    const showTierSelect = $derived(type === 'dedicated');
    const showEngineSelect = $derived(type === 'dedicated');

    // Backup system varies by database type
    const backupSystem = $derived.by(() => {
        switch (type) {
            case 'tablesdb':
            case 'documentsdb':
                return 'appwrite';
            case 'prisma':
                return 'prisma';
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

    let selectedBackupPolicy = $state<string>('daily');
    let backupRetentionDays = $state(7);
    let backupPitr = $state(false);

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

            if (type === 'prisma') {
                database = await databaseSdk.create(type, {
                    databaseId,
                    name: databaseName,
                    region: selectedRegion,
                    tier: selectedTier
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
                    backupPitr: backupEnabled ? backupPitr : undefined
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
                                description="Deploy a standby replica for automatic failover" />
                        {/if}
                    </Layout.Stack>
                </Fieldset>
            {/if}

            <Fieldset legend="Backups">
                {#if backupSystem === 'appwrite'}
                    {#if isCloud}
                        {@render cloudBackupOptions()}
                    {:else}
                        {@render selfHostedBackupOptions()}
                    {/if}
                {:else if backupSystem === 'prisma'}
                    {@render prismaBackupOptions()}
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
            on:click={() => formComponent.triggerSubmit()}
            >Create
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
                subtitle="Protect your data and ensure quick recovery by adding backup policies." />
        </div>
    {:else}
        <Alert.Inline title="This database won't be backed up" status="warning">
            Upgrade your plan to ensure your data stays safe and backed up.
            <svelte:fragment slot="actions">
                <Button compact href={$upgradeURL}>Upgrade plan</Button>
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

{#snippet prismaBackupOptions()}
    <Layout.Stack gap="l">
        <Alert.Inline status="info" title="Automatic backups included">
            Prisma Postgres automatically creates daily snapshots with 30-day retention. Backups are
            managed by Prisma and cannot be customized.
        </Alert.Inline>
    </Layout.Stack>
{/snippet}

{#snippet dedicatedBackupOptions()}
    <Layout.Stack gap="l">
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
                <Alert.Inline status="info" title="Point-in-Time Recovery">
                    PITR allows you to restore your database to any point within the retention
                    window using WAL archiving. This provides more granular recovery options but
                    increases storage usage.
                </Alert.Inline>
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
