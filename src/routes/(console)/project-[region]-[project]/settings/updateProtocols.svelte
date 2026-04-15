<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { protocols, type Protocol } from '$lib/stores/project-protocols';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../store';
    import { Divider, Layout, Spinner } from '@appwrite.io/pink-svelte';
    import { SvelteSet } from 'svelte/reactivity';
    import { ProtocolId } from '@appwrite.io/console';

    let apiProtocolUpdates = new SvelteSet<ProtocolId>();
    const protocolDescriptions: Record<ProtocolId, string> = {
        [ProtocolId.Rest]: 'Standard HTTP API requests from client SDKs.',
        [ProtocolId.Graphql]: 'GraphQL API access for queries and mutations.',
        [ProtocolId.Websocket]: 'Realtime subscriptions over WebSocket connections.'
    };

    async function protocolUpdate(protocol: Protocol) {
        apiProtocolUpdates.add(protocol.method);

        try {
            await sdk.forProject($project.region, $project.$id).project.updateProtocolStatus({
                protocolId: protocol.method,
                enabled: protocol.value
            });

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: `${protocol.label} protocol has been ${
                    protocol.value ? 'enabled' : 'disabled'
                }`
            });
            trackEvent(Submit.ProjectService, {
                method: protocol.method,
                value: protocol.value
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectService);
        } finally {
            apiProtocolUpdates.delete(protocol.method);
        }
    }

    $effect(() => protocols.load($project));
</script>

<CardGrid>
    <svelte:fragment slot="title">Protocols</svelte:fragment>
    Choose which protocols clients can use to access your project. Disabled protocols remain unavailable
    until re-enabled.
    <svelte:fragment slot="aside">
        <div class="protocols-list">
            <Layout.Stack gap="xs">
                {#each $protocols.list as protocol, index}
                    <div class="protocol-row">
                        <div class="protocol-control">
                            <InputSwitch
                                id={protocol.method}
                                label={protocol.label}
                                description={protocolDescriptions[protocol.method]}
                                bind:value={protocol.value}
                                on:change={() => protocolUpdate(protocol)}
                                disabled={apiProtocolUpdates.has(protocol.method)} />

                            {#if apiProtocolUpdates.has(protocol.method)}
                                <span class="protocol-spinner">
                                    <Spinner size="s" />
                                </span>
                            {/if}
                        </div>
                    </div>

                    {#if index < $protocols.list.length - 1}
                        <Divider />
                    {/if}
                {/each}
            </Layout.Stack>
        </div>
    </svelte:fragment>
</CardGrid>

<style>
    .protocols-list {
        max-width: 36rem;
    }

    .protocol-row {
        width: 100%;
    }

    .protocol-control {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        width: 100%;
    }

    .protocol-control :global(label) {
        flex: 1;
    }

    .protocol-spinner {
        opacity: 0.75;
        flex-shrink: 0;
    }
</style>
