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
    import Button from '$lib/elements/forms/button.svelte';
    import { Dialog, Divider, Layout, Spinner } from '@appwrite.io/pink-svelte';
    import { SvelteSet } from 'svelte/reactivity';
    import { ProtocolId } from '@appwrite.io/console';
    import { get } from 'svelte/store';

    let isUpdatingAllProtocols = $state(false);
    let showUpdateProtocolDialog = $state(false);
    let updateProtocolsEnabledMode = $state<boolean | null>(null);
    let apiProtocolUpdates = new SvelteSet<ProtocolId>();
    const protocolDescriptions: Record<ProtocolId, string> = {
        [ProtocolId.Rest]: 'Standard HTTP API requests from client SDKs.',
        [ProtocolId.Graphql]: 'GraphQL API access for queries and mutations.',
        [ProtocolId.Websocket]: 'Realtime subscriptions over WebSocket connections.'
    };
    const isAnyProtocolUpdating = $derived(apiProtocolUpdates.size > 0);
    const isAnyUpdateInProgress = $derived(isUpdatingAllProtocols || isAnyProtocolUpdating);

    const allProtocolsEnabled = $derived.by(() => {
        if (isAnyUpdateInProgress) return false;
        return $protocols.list.every((protocol) => protocol.value);
    });

    const allProtocolsDisabled = $derived.by(() => {
        if (isAnyUpdateInProgress) return false;
        return $protocols.list.every((protocol) => !protocol.value);
    });

    const shouldDisableEnableAllButton = $derived(isAnyUpdateInProgress || allProtocolsEnabled);
    const shouldDisableDisableAllButton = $derived(isAnyUpdateInProgress || allProtocolsDisabled);

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

    async function toggleAllProtocols(status: boolean) {
        isUpdatingAllProtocols = true;

        try {
            const projectSdk = sdk.forProject($project.region, $project.$id);
            for (const protocol of get(protocols).list) {
                if (protocol.value === status) continue;
                await projectSdk.project.updateProtocolStatus({
                    protocolId: protocol.method,
                    enabled: status
                });
            }

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message:
                    'All protocols for ' +
                    $project.name +
                    ' have been ' +
                    (status ? 'enabled.' : 'disabled.')
            });
            trackEvent(Submit.ProjectService);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectService);
        } finally {
            isUpdatingAllProtocols = false;
            showUpdateProtocolDialog = false;
            updateProtocolsEnabledMode = null;
        }
    }

    const dialogDetails = $derived.by(() => {
        if (updateProtocolsEnabledMode) {
            return {
                title: 'Enable all protocols',
                message: 'All project protocols will be enabled.',
                actionButton: 'Enable all'
            };
        } else {
            return {
                title: 'Disable all protocols',
                message:
                    'Are you sure you want to disable all protocols? This will disable client access over those protocols until they are re-enabled.',
                actionButton: 'Disable all'
            };
        }
    });

    $effect(() => protocols.load($project));
</script>

<CardGrid>
    <svelte:fragment slot="title">Protocols</svelte:fragment>
    Choose which protocols clients can use to access your project. Disabled protocols remain unavailable
    until re-enabled.
    <svelte:fragment slot="aside">
        <div class="protocols-list">
            <div class="protocol-toolbar">
                <Layout.Stack direction="row" alignItems="center" gap="s">
                    <Button
                        extraCompact
                        on:click={() => {
                            showUpdateProtocolDialog = true;
                            updateProtocolsEnabledMode = true;
                        }}
                        disabled={shouldDisableEnableAllButton}>Enable all</Button>
                    <span style:height="20px">
                        <Divider vertical />
                    </span>
                    <Button
                        extraCompact
                        on:click={() => {
                            showUpdateProtocolDialog = true;
                            updateProtocolsEnabledMode = false;
                        }}
                        disabled={shouldDisableDisableAllButton}>Disable all</Button>
                </Layout.Stack>
            </div>
            <div class="protocol-toolbar-divider">
                <Divider />
            </div>
            <div class="protocol-list-content">
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
        </div>
    </svelte:fragment>
</CardGrid>

<Dialog title={dialogDetails.title} bind:open={showUpdateProtocolDialog}>
    <p class="text" data-private>{dialogDetails.message}</p>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => (showUpdateProtocolDialog = false)}>Cancel</Button>

            <Button
                secondary
                submissionLoader
                disabled={isUpdatingAllProtocols}
                forceShowLoader={isUpdatingAllProtocols}
                on:click={() => toggleAllProtocols(updateProtocolsEnabledMode)}>
                {dialogDetails.actionButton}
            </Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>

<style>
    .protocols-list {
        width: 100%;
    }

    .protocol-list-content {
        max-width: 36rem;
        padding-top: var(--space-6);
    }

    .protocol-toolbar {
        display: flex;
        justify-content: flex-end;
        padding-bottom: var(--space-6);
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
