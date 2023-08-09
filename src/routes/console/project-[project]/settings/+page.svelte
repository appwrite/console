<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { organizationList } from '$lib/stores/organization';
    import { project } from '../store';
    import { Container } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import UpdateName from './updateName.svelte';
    import UpdateServices from './updateServices.svelte';
    import UpdateInstallations from './updateInstallations.svelte';
    import UpdateVariables from '../updateVariables.svelte';
    import DeleteProject from './deleteProject.svelte';
    import { services, type Service } from '$lib/stores/project-services';
    import { CardGrid, CopyInput, Box, Heading } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import {
        Button,
        Form,
        FormList,
        InputText,
        InputSwitch,
        InputSelect
    } from '$lib/elements/forms';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Transfer from './transferProject.svelte';

    export let data;

    let name: string = null;
    let teamId: string = null;
    let showDelete = false;
    let showTransfer = false;
    const endpoint = sdk.forConsole.client.config.endpoint;
    const projectId = $page.params.project;

    onMount(() => {
        name ??= $project.name;
        teamId ??= $project.teamId;

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const alert = urlParams.get('alert') ?? '';

        let notified = false;

        if (alert === 'installation-created') {
            addNotification({
                type: 'success',
                message: `Git installation has been successfully added`
            });
            trackEvent(Submit.InstallationCreate);
            notified = true;
        } else if (alert === 'installation-updated') {
            addNotification({
                type: 'success',
                message: `Git installation has been successfully updated`
            });
            trackEvent(Submit.InstallationCreate);
            notified = true;
        }

        if (notified) {
            window.history.replaceState(
                {},
                document.title,
                window.location.origin + window.location.pathname
            );
        }
    });

    async function sdkCreateVariable(key: string, value: string) {
        await sdk.forProject.projectApi.createVariable(key, value);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }

    async function sdkUpdateVariable(variableId: string, key: string, value: string) {
        await sdk.forProject.projectApi.updateVariable(variableId, key, value);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }

    async function sdkDeleteVariable(variableId: string) {
        await sdk.forProject.projectApi.deleteVariable(variableId);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }
</script>

<Container>
    {#if $project}
        <UpdateName />
        <UpdateServices />
        <UpdateInstallations {...data.installations} limit={data.limit} offset={data.offset} />
        <UpdateVariables
            {sdkCreateVariable}
            {sdkUpdateVariable}
            {sdkDeleteVariable}
            isGlobal={true}
            variableList={data.variables} />
        <DeleteProject />

        <CardGrid>
            <Heading tag="h6" size="7">Transfer project</Heading>
            <p class="text">Transfer your project to another organization that you own.</p>

            <svelte:fragment slot="aside">
                <FormList>
                    <InputSelect
                        id="organization"
                        label="Available organizations"
                        bind:value={teamId}
                        options={$organizationList.teams.map((team) => ({
                            value: team.$id,
                            label: team.name
                        }))} />
                </FormList>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    secondary
                    disabled={teamId === $project.teamId}
                    on:click={() => (showTransfer = true)}>Transfer</Button>
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

{#if teamId}
    <Transfer
        bind:teamId
        teamName={$organizationList.teams.find((t) => t.$id == teamId).name}
        bind:show={showTransfer} />
{/if}
