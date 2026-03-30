<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputTags } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    let maxConnections: number = $state(database.networkMaxConnections);
    let idleTimeout: number = $state(database.networkIdleTimeoutSeconds);
    let ipAllowlist: string[] = $state([...(database.networkIPAllowlist ?? [])]);

    const hasChanges = $derived(
        maxConnections !== database.networkMaxConnections ||
            idleTimeout !== database.networkIdleTimeoutSeconds ||
            JSON.stringify(ipAllowlist) !== JSON.stringify(database.networkIPAllowlist ?? [])
    );

    async function updateNetwork() {
        try {
            await sdk.forProject(page.params.region, page.params.project).compute.updateDatabase({
                databaseId: database.$id,
                networkMaxConnections: maxConnections,
                networkIdleTimeoutSeconds: idleTimeout,
                networkIPAllowlist: ipAllowlist
            });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Network settings have been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateNetwork);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateNetwork);
        }
    }
</script>

<Form onSubmit={updateNetwork}>
    <CardGrid>
        <svelte:fragment slot="title">Network</svelte:fragment>
        Configure connection limits and network access controls for your database.
        <svelte:fragment slot="aside">
            <ul>
                <InputNumber
                    id="maxConnections"
                    label="Max connections"
                    min={1}
                    max={10000}
                    bind:value={maxConnections}
                    required />
                <InputNumber
                    id="idleTimeout"
                    label="Idle timeout (seconds)"
                    min={0}
                    max={86400}
                    bind:value={idleTimeout}
                    required />
                <InputTags
                    id="ipAllowlist"
                    label="IP allowlist"
                    placeholder="Enter IP address and press Enter"
                    bind:tags={ipAllowlist} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
