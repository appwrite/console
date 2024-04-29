<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { FormList, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { services, type Service } from '$lib/stores/project-services';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../store';
    import EnableAllServices from './enableAllServices.svelte';
    import DisableAllServices from './disableAllServices.svelte';
    import Button from '$lib/elements/forms/button.svelte';

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
    <Heading tag="h6" size="7">Services</Heading>
    <p class="text">
        Choose services you wish to enable or disable for the client API. When disabled, the
        services are not accessible to client SDKs but remain accessible to server SDKs.
    </p>
    <svelte:fragment slot="aside">
        <div>
            <ul class="buttons-list u-main-end">
                <li class="buttons-list-item">
                    <Button text={true} on:click={() => toggleAllServices(true)}>Enable all</Button>
                </li>
                <li class="buttons-list-item">
                    <Button text={true} on:click={() => toggleAllServices(false)}>
                        Disable all
                    </Button>
                </li>
            </ul>
            <div class="u-sep-block-start u-padding-block-8 u-margin-block-start-8" />
            <form class="form">
                <FormList class="is-multiple">
                    {#each $services.list as service}
                        <InputSwitch
                            label={service.label}
                            id={service.method}
                            bind:value={service.value}
                            on:change={() => {
                                serviceUpdate(service);
                            }} />
                    {/each}
                </FormList>
            </form>
        </div>
    </svelte:fragment>
</CardGrid>

<DisableAllServices handleDisableAll={() => toggleAllServices(false)} bind:show={showDisableAll} />
<EnableAllServices handleEnableAll={() => toggleAllServices(true)} bind:show={showEnableAll} />
