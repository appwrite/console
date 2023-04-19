<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '../store';
    import { services, type Service } from '$lib/stores/project-services';
    import { CardGrid, CopyInput, Box, Heading } from '$lib/components';
    import { Button, Form, FormList, InputText, InputSwitch } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Delete from './deleteProject.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { TIER, isCloud, isFree } from '$lib/system';

    let name: string = null;
    let showDelete = false;
    const endpoint = sdk.forConsole.client.config.endpoint;
    const projectId = $page.params.project;

    onMount(async () => {
        name ??= $project.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.update($project.$id, name);
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Project name has been updated'
            });
            trackEvent(Submit.ProjectUpdateName);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectUpdateName);
        }
    }

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

    $: services.load($project);
</script>

<Container>
    {#if $project}
        {#if isCloud}
            <CardGrid>
                <Heading tag="h6" size="7">Plan Summary</Heading>
                <p class="text">
                    Your current project plan. For more information on Appwrite plans, <a
                        href="http://appwrite.io/pricing"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link">
                        view our pricing guide.</a>
                </p>
                <svelte:fragment slot="aside">
                    <div class="box u-flex u-main-space-between">
                        <div>
                            <h6 class="u-bold u-trim-1">
                                <span class="u-capitalize">{TIER}</span> plan
                            </h6>
                            <p class="text">REGION</p>
                        </div>
                        {#if !isFree}
                            <p>PRICE</p>
                        {/if}
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    {#if isFree}
                        <Button event="change_plan">Upgrade to Pro</Button>
                    {:else}
                        <Button text event="change_plan">Change plan</Button>
                        <Button secondary event="change_plan">View payment details</Button>
                    {/if}
                </svelte:fragment>
            </CardGrid>
        {/if}
        <Form onSubmit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7">API Credentials</Heading>
                <p class="text">Access Appwrite services using your API Endpoint and Project ID.</p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <CopyInput label="Project ID" showLabel={true} value={$project.$id} />
                        <CopyInput label="API Endpoint" showLabel={true} value={endpoint} />
                    </FormList>
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button
                        secondary
                        event="view_keys"
                        href={`${base}/console/project-${projectId}/overview/keys#integrations`}>
                        View API Keys
                    </Button>
                </svelte:fragment>
            </CardGrid>
            <CardGrid>
                <Heading tag="h6" size="7">Name</Heading>

                <svelte:fragment slot="aside">
                    <FormList>
                        <InputText
                            id="name"
                            label="Name"
                            bind:value={name}
                            required
                            placeholder="Enter name" />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $project.name} submit>Update</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid>
            <Heading tag="h6" size="7">Services</Heading>
            <p class="text">Choose services you wish to enable or disable.</p>
            <svelte:fragment slot="aside">
                <FormList>
                    <form class="form">
                        <ul class="form-list is-multiple">
                            {#each $services.list as service}
                                <InputSwitch
                                    label={service.label}
                                    id={service.method}
                                    bind:value={service.value}
                                    on:change={() => {
                                        serviceUpdate(service);
                                    }} />
                            {/each}
                        </ul>
                    </form>
                </FormList>
            </svelte:fragment>
        </CardGrid>

        <CardGrid danger>
            <div>
                <Heading tag="h6" size="7">Delete Project</Heading>
            </div>
            <p>
                The project will be permanently deleted, including all the metadata, resources and
                stats within it. This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$project.name}</h6>
                    </svelte:fragment>
                    <p>Last update: {toLocaleDateTime($project.$updatedAt)}</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
