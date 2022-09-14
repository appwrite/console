<script lang="ts">
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '../store';
    import { services, type Service } from '$lib/stores/project-services';
    import { CardGrid, CopyInput, Box } from '$lib/components';
    import { Button, Form, FormList, InputText, InputSwitch } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import Delete from './_deleteProject.svelte';

    let name: string = null;
    let showDelete = false;
    const endpoint = sdkForConsole.client.config.endpoint;

    onMount(async () => {
        await project.load($page.params.project);

        name ??= $project.name;
    });

    const updateName = async () => {
        try {
            await sdkForConsole.projects.update($project.$id, name);
            $project.name = name;
            addNotification({
                type: 'success',
                message: 'Project name has been updated'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    const serviceUpdate = async (service: Service) => {
        try {
            await sdkForConsole.projects.updateServiceStatus(
                $project.$id,
                service.method,
                service.value
            );
            addNotification({
                type: 'success',
                message: `${service.label} service has been ${
                    service.value ? 'enabled' : 'disabled'
                }`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };

    $: services.load($project);
</script>

<Container>
    {#if $project}
        <Form on:submit={updateName}>
            <CardGrid>
                <h6 class="heading-level-7">Update Name</h6>

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
            <h6 class="heading-level-7">API Credentials</h6>
            <p class="text">
                Access Appwrite services using your API Endpoint and Project ID. You can connect
                Appwrite to your applications and server-side code by <a href="#/" class="link"
                    >integrating a new platform</a>
                or
                <a href="#/" class="link">creating an API key</a>.
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <CopyInput label="Project ID" showLabel={true} value={$project.$id} />
                    <CopyInput label="API Endpoint" showLabel={true} value={endpoint} />
                </FormList>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <h6 class="heading-level-7">Services</h6>
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

        <CardGrid>
            <div>
                <h6 class="heading-level-7">Delete Project</h6>
            </div>
            <p>
                The project will be permanently deleted, including all the metadata, resources and
                stats within it. This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$project.name}</h6>
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
