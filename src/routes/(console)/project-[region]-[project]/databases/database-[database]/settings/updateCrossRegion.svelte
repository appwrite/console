<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { DedicatedDatabase, CrossRegionStatus } from '$lib/sdk/dedicatedDatabases';
    import { Badge, Layout } from '@appwrite.io/pink-svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    const regionOptions: { value: string; label: string }[] = [
        { value: 'fra', label: 'Frankfurt' },
        { value: 'nyc', label: 'New York' },
        { value: 'sfo', label: 'San Francisco' },
        { value: 'blr', label: 'Bangalore' },
        { value: 'lon', label: 'London' },
        { value: 'syd', label: 'Sydney' },
        { value: 'tor', label: 'Toronto' },
        { value: 'ams', label: 'Amsterdam' },
        { value: 'sgp', label: 'Singapore' }
    ];

    let crossRegionStatus: CrossRegionStatus | null = $state(null);
    let isLoading = $state(true);
    let isEnabled = $state(false);

    let standbyRegion: string = $state('');
    let isEnabling = $state(false);

    let showDisableConfirm = $state(false);
    let isDisabling = $state(false);

    let showFailoverConfirm = $state(false);
    let isFailingOver = $state(false);

    const availableRegionOptions = $derived(
        regionOptions.filter((r) => r.value !== database.region)
    );

    function getStandbyStatusVariant(
        status: string
    ): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
        switch (status) {
            case 'healthy':
                return 'success';
            case 'provisioning':
                return 'primary';
            case 'degraded':
                return 'warning';
            case 'unhealthy':
                return 'error';
            default:
                return 'secondary';
        }
    }

    onMount(async () => {
        try {
            crossRegionStatus = await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.getCrossRegionStatus(database.$id);
            isEnabled = crossRegionStatus.enabled;
        } catch {
            // 404 means not enabled
            isEnabled = false;
            crossRegionStatus = null;
        } finally {
            isLoading = false;
        }
    });

    async function enableCrossRegion() {
        if (!standbyRegion) return;
        isEnabling = true;
        try {
            crossRegionStatus = await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.enableCrossRegion(database.$id, standbyRegion);

            isEnabled = true;
            standbyRegion = '';

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Cross-region failover has been enabled',
                type: 'success'
            });

            trackEvent(Submit.DatabaseEnableCrossRegion);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseEnableCrossRegion);
        } finally {
            isEnabling = false;
        }
    }

    async function disableCrossRegion() {
        isDisabling = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.disableCrossRegion(database.$id);

            isEnabled = false;
            crossRegionStatus = null;
            showDisableConfirm = false;

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Cross-region failover has been disabled',
                type: 'success'
            });

            trackEvent(Submit.DatabaseDisableCrossRegion);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseDisableCrossRegion);
        } finally {
            isDisabling = false;
        }
    }

    async function triggerFailover() {
        isFailingOver = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.triggerCrossRegionFailover(database.$id);

            showFailoverConfirm = false;

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Cross-region failover has been triggered',
                type: 'success'
            });

            trackEvent(Submit.DatabaseTriggerCrossRegionFailover);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseTriggerCrossRegionFailover);
        } finally {
            isFailingOver = false;
        }
    }
</script>

{#if !isLoading}
    {#if isEnabled && crossRegionStatus}
        <CardGrid>
            <svelte:fragment slot="title">Cross-region failover</svelte:fragment>
            Your database has a standby replica in another region for disaster recovery. In the event
            of a regional outage, you can trigger a failover to promote the standby to primary.
            <svelte:fragment slot="aside">
                <ul>
                    <li class="u-margin-block-end-16">
                        <Layout.Stack direction="column" gap="s">
                            <div class="box">
                                <Layout.Stack direction="column" gap="xs">
                                    <Layout.Stack direction="row" gap="xs" alignItems="center">
                                        <span class="u-bold">Standby status</span>
                                        <Badge
                                            variant={getStandbyStatusVariant(crossRegionStatus.standbyStatus)}
                                            content={crossRegionStatus.standbyStatus} />
                                    </Layout.Stack>
                                    <span class="text u-x-small">
                                        Primary: {crossRegionStatus.primaryRegion}
                                        &bull; Standby: {crossRegionStatus.standbyRegion}
                                    </span>
                                    <span class="text u-x-small">
                                        Lag: {crossRegionStatus.lagSeconds}s
                                        &bull; Last synced: {toLocaleDateTime(crossRegionStatus.lastSyncedAt)}
                                    </span>
                                </Layout.Stack>
                            </div>
                        </Layout.Stack>
                    </li>
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Layout.Stack direction="row" gap="s">
                    <Button
                        secondary
                        on:click={() => {
                            showDisableConfirm = true;
                        }}>
                        Disable
                    </Button>
                    <Button
                        danger
                        on:click={() => {
                            showFailoverConfirm = true;
                        }}>
                        Trigger failover
                    </Button>
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    {:else}
        <Form onSubmit={enableCrossRegion}>
            <CardGrid>
                <svelte:fragment slot="title">Cross-region failover</svelte:fragment>
                Enable cross-region failover to maintain a standby replica in a different region for
                disaster recovery.
                <svelte:fragment slot="aside">
                    <ul>
                        <InputSelect
                            id="standbyRegion"
                            label="Standby region"
                            placeholder="Select a region"
                            bind:value={standbyRegion}
                            options={availableRegionOptions} />
                    </ul>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={!standbyRegion || isEnabling} submit>
                        {isEnabling ? 'Enabling...' : 'Enable'}
                    </Button>
                </svelte:fragment>
            </CardGrid>
        </Form>
    {/if}

    <Modal
        title="Disable cross-region failover"
        bind:show={showDisableConfirm}
        onSubmit={disableCrossRegion}>
        <p class="text">
            Are you sure you want to disable cross-region failover for <b>{database.name}</b>?
            The standby replica will be removed and your database will no longer have
            disaster recovery across regions.
        </p>
        <svelte:fragment slot="footer">
            <Button
                text
                on:click={() => {
                    showDisableConfirm = false;
                }}>Cancel</Button>
            <Button danger submit disabled={isDisabling}>
                {isDisabling ? 'Disabling...' : 'Disable'}
            </Button>
        </svelte:fragment>
    </Modal>

    <Modal
        title="Trigger cross-region failover"
        bind:show={showFailoverConfirm}
        onSubmit={triggerFailover}>
        <p class="text">
            Are you sure you want to trigger a cross-region failover for <b>{database.name}</b>?
            This will promote the standby replica in <b>{crossRegionStatus?.standbyRegion}</b>
            to primary. The current primary in <b>{crossRegionStatus?.primaryRegion}</b> will
            become the new standby. This operation may cause brief downtime.
        </p>
        <svelte:fragment slot="footer">
            <Button
                text
                on:click={() => {
                    showFailoverConfirm = false;
                }}>Cancel</Button>
            <Button danger submit disabled={isFailingOver}>
                {isFailingOver ? 'Failing over...' : 'Trigger failover'}
            </Button>
        </svelte:fragment>
    </Modal>
{/if}
