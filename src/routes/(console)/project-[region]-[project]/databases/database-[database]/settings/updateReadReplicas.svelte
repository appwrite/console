<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { DedicatedDatabase, ReadReplica } from '$lib/sdk/dedicatedDatabases';
    import { Badge, Layout } from '@appwrite.io/pink-svelte';

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

    let replicas: ReadReplica[] = $state([]);
    let isLoading = $state(true);

    let targetRegion: string = $state('');
    let crossZoneConsent: boolean = $state(false);
    let isCreating = $state(false);

    let showDeleteConfirm = $state(false);
    let replicaToDelete: ReadReplica | null = $state(null);
    let isDeleting = $state(false);

    const availableRegionOptions = $derived(
        regionOptions.filter(
            (r) =>
                r.value !== database.region &&
                !replicas.some((rep) => rep.targetRegion === r.value)
        )
    );

    onMount(async () => {
        try {
            const result = await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.listReadReplicas(database.$id);
            replicas = result.replicas ?? [];
        } catch {
            replicas = [];
        } finally {
            isLoading = false;
        }
    });

    function getStatusVariant(
        status: string
    ): 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
        switch (status) {
            case 'active':
                return 'success';
            case 'provisioning':
                return 'primary';
            case 'degraded':
                return 'warning';
            case 'failed':
                return 'error';
            case 'deleting':
                return 'warning';
            default:
                return 'secondary';
        }
    }

    async function addReplica() {
        if (!targetRegion) return;
        isCreating = true;
        try {
            const replica = await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.createReadReplica(
                    database.$id,
                    targetRegion,
                    crossZoneConsent
                );

            replicas = [...replicas, replica];
            targetRegion = '';
            crossZoneConsent = false;

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Read replica is being provisioned',
                type: 'success'
            });

            trackEvent(Submit.DatabaseCreateReadReplica);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseCreateReadReplica);
        } finally {
            isCreating = false;
        }
    }

    async function deleteReplica() {
        if (!replicaToDelete) return;
        isDeleting = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.deleteReadReplica(database.$id, replicaToDelete.$id);

            replicas = replicas.filter((r) => r.$id !== replicaToDelete?.$id);
            showDeleteConfirm = false;
            replicaToDelete = null;

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Read replica has been deleted',
                type: 'success'
            });

            trackEvent(Submit.DatabaseDeleteReadReplica);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseDeleteReadReplica);
        } finally {
            isDeleting = false;
        }
    }
</script>

{#if !isLoading}
    <Form onSubmit={addReplica}>
        <CardGrid>
            <svelte:fragment slot="title">Read replicas</svelte:fragment>
            Deploy read-only replicas of your database to other regions to reduce read latency for
            geographically distributed workloads.
            <svelte:fragment slot="aside">
                <ul>
                    {#if replicas.length > 0}
                        <li class="u-margin-block-end-16">
                            <label class="label u-margin-block-end-8">Active replicas</label>
                            <Layout.Stack direction="column" gap="s">
                                {#each replicas as replica}
                                    <div class="box">
                                        <Layout.Stack
                                            direction="row"
                                            gap="s"
                                            justifyContent="space-between"
                                            alignItems="center">
                                            <Layout.Stack direction="column" gap="xxs">
                                                <Layout.Stack direction="row" gap="xs" alignItems="center">
                                                    <span class="u-bold">{replica.$id}</span>
                                                    <Badge
                                                        variant={getStatusVariant(replica.status)}
                                                        content={replica.status} />
                                                </Layout.Stack>
                                                <span class="text u-x-small">
                                                    {replica.sourceRegion} &rarr; {replica.targetRegion}
                                                    &bull; Lag: {replica.lagSeconds}s
                                                    &bull; {replica.hostname}
                                                </span>
                                            </Layout.Stack>
                                            <Button
                                                text
                                                danger
                                                on:click={() => {
                                                    replicaToDelete = replica;
                                                    showDeleteConfirm = true;
                                                }}>
                                                Delete
                                            </Button>
                                        </Layout.Stack>
                                    </div>
                                {/each}
                            </Layout.Stack>
                        </li>
                    {:else}
                        <li class="u-margin-block-end-16">
                            <p class="text">No read replicas configured.</p>
                        </li>
                    {/if}

                    {#if availableRegionOptions.length > 0}
                        <InputSelect
                            id="targetRegion"
                            label="Target region"
                            placeholder="Select a region"
                            bind:value={targetRegion}
                            options={availableRegionOptions} />
                        <InputCheckbox
                            id="crossZoneConsent"
                            label="I consent to cross-zone data transfer charges"
                            bind:checked={crossZoneConsent} />
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={!targetRegion || isCreating} submit>
                    {isCreating ? 'Adding...' : 'Add replica'}
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <Modal
        title="Delete read replica"
        bind:show={showDeleteConfirm}
        onSubmit={deleteReplica}>
        <p class="text">
            Are you sure you want to delete the read replica
            <b>{replicaToDelete?.$id}</b> in region <b>{replicaToDelete?.targetRegion}</b>?
            This action cannot be undone.
        </p>
        <svelte:fragment slot="footer">
            <Button
                text
                on:click={() => {
                    showDeleteConfirm = false;
                    replicaToDelete = null;
                }}>Cancel</Button>
            <Button danger submit disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
        </svelte:fragment>
    </Modal>
{/if}
