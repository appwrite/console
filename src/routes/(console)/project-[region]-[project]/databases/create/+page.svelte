<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { writable } from 'svelte/store';
    import { Form, InputText, Button } from '$lib/elements/forms';
    import { Alert, Card, Fieldset, Icon, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { resolveRoute } from '$lib/stores/navigation';
    import { afterNavigate, goto } from '$app/navigation';
    import { CustomId } from '$lib/components';
    import { page } from '$app/state';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { ID, type Models } from '@appwrite.io/console';
    import { type DatabaseType, useDatabasesSdk } from '$database/(entity)';
    import { isCloud } from '$lib/system';
    import { upgradeURL } from '$lib/stores/billing';
    import { BillingPlan } from '$lib/constants';
    import { organization } from '$lib/stores/organization';
    import EmptyDarkMobile from '$lib/images/backups/upgrade/backups-mobile-dark.png';
    import EmptyLightMobile from '$lib/images/backups/upgrade/backups-mobile-light.png';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { trackEvent } from '$lib/actions/analytics';
    import CreatePolicy from '$database/backups/createPolicy.svelte';
    import { cronExpression, type UserBackupPolicy } from '$lib/helpers/backups';

    import Mongo from '../(assets)/mongo.svelte';
    import { isTabletViewport } from '$lib/stores/viewport';

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
                'Store flexible data without a fixed schema. Best for unstructured data and simple querying.'
        }
    ];

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

            return sdk
                .forProject(page.params.region, page.params.project)
                .backups.createPolicy(
                    ID.unique(),
                    ['databases'],
                    policy.retained,
                    policy.schedule,
                    policy.label,
                    resourceId
                );
        });

        await Promise.all(totalPoliciesPromise);
        trackPolicyEvents();
    }

    async function createDatabase() {
        try {
            databaseId ??= ID.unique();

            let database: Models.Database;
            const databasesSdk = useDatabasesSdk(page.params.region, page.params.project);

            database = await databasesSdk.create(type, {
                databaseId,
                name: databaseName
            });

            await createPolicies(database.$id);

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

            <Fieldset legend="Backups">
                {#if isCloud}
                    {@render cloudBackupOptions()}
                {:else}
                    {@render selfHostedBackupOptions()}
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
    {#if $organization?.billingPlan !== BillingPlan.FREE}
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
                    icon={databaseType.type === 'documentsdb' ? Mongo : undefined}>
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
