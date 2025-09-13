<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { services, type Service } from '$lib/stores/project-services';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../store';
    import Button from '$lib/elements/forms/button.svelte';
    import { Dialog, Divider, Layout, Spinner } from '@appwrite.io/pink-svelte';
    import type { ApiService } from '@appwrite.io/console';

    let isUpdatingStatus = $state(false);
    let showUpdateServiceDialog = $state(false);
    let updateServicesEnabledMode = $state<boolean | null>(null);

    let singleApiServiceUpdate = $state<ApiService | null>(null);

    const allServicesEnabled = $derived.by(
        () => isUpdatingStatus || $services.list.every((service) => service.value)
    );
    const allServicesDisabled = $derived.by(
        () => isUpdatingStatus || $services.list.every((service) => !service.value)
    );

    async function serviceUpdate(service: Service) {
        isUpdatingStatus = true;
        singleApiServiceUpdate = service.method;

        try {
            await sdk.forConsole.projects.updateServiceStatus({
                projectId: $project.$id,
                service: service.method,
                status: service.value
            });

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: `${service.label} service has been ${
                    service.value ? 'enabled' : 'disabled'
                }`
            });
            trackEvent(Submit.ProjectService, {
                method: service.method,
                value: service.value
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectService);
        } finally {
            isUpdatingStatus = false;
            singleApiServiceUpdate = null;
        }
    }

    async function toggleAllServices(status: boolean) {
        isUpdatingStatus = true;

        try {
            await sdk.forConsole.projects.updateServiceStatusAll({
                projectId: $project.$id,
                status
            });

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message:
                    'All services for ' +
                    $project.name +
                    ' has been ' +
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
            isUpdatingStatus = false;
            showUpdateServiceDialog = false;
            updateServicesEnabledMode = null;
        }
    }

    const dialogDetails = $derived.by(() => {
        if (updateServicesEnabledMode) {
            return {
                title: 'Enable all services',
                message: 'All project services will be enabled.',
                actionButton: 'Enable all'
            };
        } else {
            return {
                title: 'Disable all services',
                message:
                    'Are you sure you want to disable all services? This will disable API requests to this project for all Client SDKs.',
                actionButton: 'Disable all'
            };
        }
    });

    $effect(() => services.load($project));
</script>

<CardGrid>
    <svelte:fragment slot="title">Services</svelte:fragment>
    Choose services you wish to enable or disable for the client API. When disabled, the services are
    not accessible to client SDKs but remain accessible to server SDKs.
    <svelte:fragment slot="aside">
        <Layout.Stack gap="m">
            <Layout.Stack direction="row" alignItems="center" gap="s">
                <Button
                    extraCompact
                    on:click={() => {
                        showUpdateServiceDialog = true;
                        updateServicesEnabledMode = true;
                    }}
                    disabled={allServicesEnabled}>Enable all</Button>
                <span style:height="20px">
                    <Divider vertical />
                </span>
                <Button
                    extraCompact
                    on:click={() => {
                        showUpdateServiceDialog = true;
                        updateServicesEnabledMode = false;
                    }}
                    disabled={allServicesDisabled}>Disable all</Button>
            </Layout.Stack>
            <Layout.Stack gap="l">
                <Divider />
                <Layout.Stack direction="row" wrap="wrap">
                    {#each $services.list as service}
                        <span style:flex-basis="30%">
                            <Layout.Stack direction="row" alignItems="center">
                                <InputSwitch
                                    id={service.method}
                                    label={service.label}
                                    bind:value={service.value}
                                    on:change={() => serviceUpdate(service)}
                                    disabled={singleApiServiceUpdate === service.method} />

                                {#if singleApiServiceUpdate === service.method}
                                    <span style:opacity="0.75">
                                        <Spinner size="s" />
                                    </span>
                                {/if}
                            </Layout.Stack>
                        </span>
                    {/each}
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>
</CardGrid>

<Dialog title={dialogDetails.title} bind:open={showUpdateServiceDialog}>
    <p class="text" data-private>{dialogDetails.message}</p>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => (showUpdateServiceDialog = false)}>Cancel</Button>

            <Button
                secondary
                submissionLoader
                disabled={isUpdatingStatus}
                forceShowLoader={isUpdatingStatus}
                on:click={() => toggleAllServices(updateServicesEnabledMode)}>
                {dialogDetails.actionButton}
            </Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
