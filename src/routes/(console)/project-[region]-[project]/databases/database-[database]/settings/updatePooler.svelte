<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { DedicatedDatabase, PoolerConfig, PoolerMode } from '$lib/sdk/dedicatedDatabases';
    import { onMount } from 'svelte';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    const modeOptions: { value: PoolerMode; label: string }[] = [
        { value: 'transaction', label: 'Transaction' },
        { value: 'session', label: 'Session' }
    ];

    let poolerConfig: PoolerConfig | null = $state(null);
    let isLoading = $state(true);

    let poolerEnabled: boolean = $state(false);
    let poolerMode: PoolerMode = $state('transaction');
    let poolSize: number = $state(25);

    let initialEnabled = $state(false);
    let initialMode: PoolerMode = $state('transaction');
    let initialPoolSize = $state(25);

    onMount(async () => {
        try {
            poolerConfig = await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.getPoolerConfig(database.$id);

            poolerEnabled = poolerConfig.enabled;
            poolerMode = poolerConfig.mode;
            poolSize = poolerConfig.defaultPoolSize;

            initialEnabled = poolerConfig.enabled;
            initialMode = poolerConfig.mode;
            initialPoolSize = poolerConfig.defaultPoolSize;
        } catch {
            // Pooler not configured yet
            poolerEnabled = false;
        } finally {
            isLoading = false;
        }
    });

    const hasChanges = $derived(
        poolerEnabled !== initialEnabled ||
            poolerMode !== initialMode ||
            poolSize !== initialPoolSize
    );

    async function updatePooler() {
        try {
            const dedicatedSdk = sdk.forProject(
                page.params.region,
                page.params.project
            ).dedicatedDatabases;

            await dedicatedSdk.updatePoolerConfig(database.$id, {
                mode: poolerEnabled ? poolerMode : undefined,
                defaultPoolSize: poolerEnabled ? poolSize : undefined
            });

            initialEnabled = poolerEnabled;
            initialMode = poolerMode;
            initialPoolSize = poolSize;

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Connection pooler settings have been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdatePooler);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdatePooler);
        }
    }
</script>

{#if !isLoading}
    <Form onSubmit={updatePooler}>
        <CardGrid>
            <svelte:fragment slot="title">Connection pooler</svelte:fragment>
            A connection pooler sits between your application and the database, reusing connections
            to reduce overhead. Transaction mode is recommended for serverless workloads.
            <svelte:fragment slot="aside">
                <ul>
                    <InputSwitch
                        id="poolerEnabled"
                        label="Enable connection pooler"
                        bind:value={poolerEnabled} />
                    {#if poolerEnabled}
                        <InputSelect
                            id="poolerMode"
                            label="Pooler mode"
                            bind:value={poolerMode}
                            options={modeOptions} />
                        <InputNumber
                            id="poolSize"
                            label="Default pool size"
                            min={1}
                            max={10000}
                            bind:value={poolSize}
                            required />
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={!hasChanges} submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
{/if}
