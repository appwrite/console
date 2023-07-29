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
    import LL from '$i18n/i18n-svelte';

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
        <Form onSubmit={updateName}>
            <CardGrid>
                <Heading tag="h6" size="7">{$LL.console.project.title.apiCredentials()}</Heading>
                <p class="text">{$LL.console.project.texts.consoleSettings.accessService()}</p>
                <svelte:fragment slot="aside">
                    <FormList>
                        <CopyInput
                            label={$LL.console.project.forms.settings.default.inputs.projectId.label()}
                            showLabel={true}
                            value={$project.$id} />
                        <CopyInput
                            label={$LL.console.project.forms.settings.default.inputs.apiEndPoint.label()}
                            showLabel={true}
                            value={endpoint} />
                    </FormList>
                </svelte:fragment>
                <svelte:fragment slot="actions">
                    <Button
                        secondary
                        event="view_keys"
                        href={`${base}/console/project-${projectId}/overview/keys#integrations`}>
                        {$LL.console.project.button.viewApiKeys()}
                    </Button>
                </svelte:fragment>
            </CardGrid>
            <CardGrid>
                <Heading tag="h6" size="7"
                    >{$LL.console.project.forms.settings.updateName.title()}</Heading>

                <svelte:fragment slot="aside">
                    <FormList>
                        <InputText
                            id="name"
                            label={$LL.console.project.forms.settings.updateName.inputs.name.label()}
                            placeholder={$LL.console.project.forms.settings.updateName.inputs.name.defaultPlaceholder()}
                            bind:value={name}
                            required />
                    </FormList>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={name === $project.name} submit
                        >{$LL.console.project.button.submit.update()}</Button>
                </svelte:fragment>
            </CardGrid>
        </Form>

        <CardGrid>
            <Heading tag="h6" size="7">{$LL.console.project.title.services()}</Heading>
            <p class="text">{$LL.console.project.texts.consoleSettings.options()}</p>
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
                <Heading tag="h6" size="7">{$LL.console.project.title.deleteProject()}</Heading>
            </div>
            <p>
                {$LL.console.project.texts.consoleSettings.deleteAll()}
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$project.name}</h6>
                    </svelte:fragment>
                    <p>
                        {$LL.console.project.texts.consoleSettings.lastUpdated()}{' '}{toLocaleDateTime(
                            $project.$updatedAt
                        )}
                    </p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}
                    >{$LL.console.project.button.submit.delete()}</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
