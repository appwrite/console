<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        InputSwitch,
        InputNumber,
        InputSelect
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type {
        DedicatedDatabase,
        HAStatus,
        HASyncMode
    } from '$lib/sdk/dedicatedDatabases';
    import { Badge, Layout } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    const syncModeOptions: { value: HASyncMode; label: string }[] = [
        { value: 'async', label: 'Asynchronous' },
        { value: 'sync', label: 'Synchronous' },
        { value: 'quorum', label: 'Quorum' }
    ];

    let haStatus: HAStatus | null = $state(null);
    let isLoading = $state(true);

    let haEnabled: boolean = $state(database.highAvailability);
    let replicaCount: number = $state(database.haReplicaCount);
    let syncMode: HASyncMode = $state(database.haSyncMode ?? 'async');

    let initialEnabled = $state(database.highAvailability);
    let initialReplicaCount = $state(database.haReplicaCount);
    let initialSyncMode: HASyncMode = $state(database.haSyncMode ?? 'async');

    let showFailoverConfirm = $state(false);
    let isFailingOver = $state(false);

    const hasChanges = $derived(
        haEnabled !== initialEnabled ||
            replicaCount !== initialReplicaCount ||
            syncMode !== initialSyncMode
    );

    function getHealthVariant(
        status: string
    ): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
        switch (status) {
            case 'healthy':
                return 'success';
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
            haStatus = await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.getHAStatus(database.$id);
        } catch {
            haStatus = null;
        } finally {
            isLoading = false;
        }
    });

    async function updateHA() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.update(database.$id, {
                    highAvailability: haEnabled,
                    haReplicaCount: replicaCount,
                    haSyncMode: syncMode
                });

            initialEnabled = haEnabled;
            initialReplicaCount = replicaCount;
            initialSyncMode = syncMode;

            // Refresh HA status after update
            try {
                haStatus = await sdk
                    .forProject(page.params.region, page.params.project)
                    .dedicatedDatabases.getHAStatus(database.$id);
            } catch {
                // Ignore if HA was just disabled
            }

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'High availability settings have been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateHA);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateHA);
        }
    }

    async function manualFailover() {
        isFailingOver = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.createFailover(database.$id);

            showFailoverConfirm = false;

            // Refresh HA status
            try {
                haStatus = await sdk
                    .forProject(page.params.region, page.params.project)
                    .dedicatedDatabases.getHAStatus(database.$id);
            } catch {
                // Ignore
            }

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Manual failover has been initiated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseManualFailover);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseManualFailover);
        } finally {
            isFailingOver = false;
        }
    }
</script>

{#if !isLoading}
    <Form onSubmit={updateHA}>
        <CardGrid>
            <svelte:fragment slot="title">High availability</svelte:fragment>
            High availability maintains replicas of your database that automatically take over if the
            primary instance fails, minimizing downtime.
            <svelte:fragment slot="aside">
                <ul>
                    <InputSwitch
                        id="haEnabled"
                        label="Enable high availability"
                        bind:value={haEnabled} />
                    {#if haEnabled}
                        <InputNumber
                            id="replicaCount"
                            label="Replica count"
                            min={1}
                            max={5}
                            bind:value={replicaCount}
                            required />
                        <InputSelect
                            id="syncMode"
                            label="Sync mode"
                            bind:value={syncMode}
                            options={syncModeOptions} />
                    {/if}

                    {#if haStatus && haStatus.replicas.length > 0}
                        <li class="u-margin-block-start-16">
                            <label class="label u-margin-block-end-8">Replicas</label>
                            <Layout.Stack direction="column" gap="s">
                                {#each haStatus.replicas as replica}
                                    <div class="box">
                                        <Layout.Stack direction="row" gap="xs" alignItems="center">
                                            <span class="u-bold">{replica.$id}</span>
                                            <Badge
                                                variant={replica.role === 'primary' ? 'primary' : 'secondary'}
                                                content={replica.role} />
                                            <Badge
                                                variant={getHealthVariant(replica.status)}
                                                content={replica.status} />
                                            <span class="text u-x-small">
                                                Lag: {replica.lagSeconds}s
                                            </span>
                                        </Layout.Stack>
                                    </div>
                                {/each}
                            </Layout.Stack>
                        </li>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Layout.Stack direction="row" gap="s">
                    {#if haEnabled && haStatus?.enabled}
                        <Button
                            secondary
                            on:click={() => {
                                showFailoverConfirm = true;
                            }}>
                            Manual failover
                        </Button>
                    {/if}
                    <Button disabled={!hasChanges} submit>Update</Button>
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Modal
        title="Manual failover"
        bind:show={showFailoverConfirm}
        onSubmit={manualFailover}>
        <p class="text">
            Are you sure you want to trigger a manual failover for <b>{database.name}</b>?
            This will promote a replica to primary. The operation may cause brief downtime
            while the roles are switched.
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
