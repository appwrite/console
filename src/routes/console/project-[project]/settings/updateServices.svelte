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
</script>

<CardGrid>
    <Heading tag="h6" size="7">Services</Heading>
    <p class="text">
        Choose services you wish to enable or disable for the client API. When disabled, the
        services are not accessible to client SDKs but remain accessible to server SDKs.
    </p>
    <svelte:fragment slot="aside">
        <FormList>
            <form class="form">
                <ul class="form-list is-multiple">
                    {#each $services.list as service}
                        <InputSwitch
                            label={service.label}
                            id={service.method}
                            bind:value={service.value}
                            on:change={() => serviceUpdate(service)} />
                    {/each}
                </ul>
            </form>
        </FormList>
    </svelte:fragment>
</CardGrid>
