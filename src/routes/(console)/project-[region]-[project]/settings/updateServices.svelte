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
    import EnableAllServices from './enableAllServices.svelte';
    import DisableAllServices from './disableAllServices.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { Divider, Layout } from '@appwrite.io/pink-svelte';

    let showDisableAll = false;
    let showEnableAll = false;

    async function serviceUpdate(service: Service) {
        try {
            await sdk.forConsole.projects.updateServiceStatus(
                $project.$id,
                service.method,
                service.value
            );
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
        }
    }

    async function toggleAllServices(status: boolean) {
        if (status && !showEnableAll) {
            showEnableAll = true;
            return;
        }
        if (!status && !showDisableAll) {
            showDisableAll = true;
            return;
        }

        try {
            await sdk.forConsole.projects.updateServiceStatusAll($project.$id, status);
            invalidate(Dependencies.PROJECT);
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
            showDisableAll = false;
            showEnableAll = false;
        }
    }

    $: services.load($project);
</script>

<CardGrid>
    <svelte:fragment slot="title">Services</svelte:fragment>
    Choose services you wish to enable or disable for the client API. When disabled, the services are
    not accessible to client SDKs but remain accessible to server SDKs.
    <svelte:fragment slot="aside">
        <Layout.Stack gap="m">
            <Layout.Stack direction="row" alignItems="center" gap="s">
                <Button extraCompact on:click={() => toggleAllServices(true)}>Enable all</Button>
                <span style:height="20px">
                    <Divider vertical />
                </span>
                <Button extraCompact on:click={() => toggleAllServices(false)}>Disable all</Button>
            </Layout.Stack>
            <Layout.Stack gap="l">
                <Divider />
                <Layout.Stack direction="row" wrap="wrap">
                    {#each $services.list as service}
                        <span style:flex-basis="30%">
                            <InputSwitch
                                label={service.label}
                                id={service.method}
                                bind:value={service.value}
                                on:change={() => serviceUpdate(service)} />
                        </span>
                    {/each}
                </Layout.Stack>
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>
</CardGrid>

<DisableAllServices handleDisableAll={() => toggleAllServices(false)} bind:show={showDisableAll} />
<EnableAllServices handleEnableAll={() => toggleAllServices(true)} bind:show={showEnableAll} />
