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
    import { CardGrid, Heading } from '$lib/components';
    import { Button, FormList, InputSelect } from '$lib/elements/forms';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { page } from '$app/stores';
    import { canWriteProjects } from '$lib/stores/roles';
    import Transfer from './transferProject.svelte';

    export let data;

    let teamId: string = null;
    let showTransfer = false;

    onMount(() => {
        teamId ??= $project.teamId;

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);

        const alert = urlParams.get('alert') ?? '';

        let notified = false;

        if (alert === 'installation-created') {
            addNotification({
                type: 'success',
                message: `Git installation has imported to your project`
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
        await sdk
            .forProject($page.params.region, $page.params.project)
            .projectApi.createVariable(key, value);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }

    async function sdkUpdateVariable(variableId: string, key: string, value: string) {
        await sdk
            .forProject($page.params.region, $page.params.project)
            .projectApi.updateVariable(variableId, key, value);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }

    async function sdkDeleteVariable(variableId: string) {
        await sdk
            .forProject($page.params.region, $page.params.project)
            .projectApi.deleteVariable(variableId);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }
</script>

<Container>
    {#if $project}
        <UpdateName />
        {#if $canWriteProjects}
            <UpdateServices />
            <UpdateInstallations {...data.installations} limit={data.limit} offset={data.offset} />
            <UpdateVariables
                {sdkCreateVariable}
                {sdkUpdateVariable}
                {sdkDeleteVariable}
                isGlobal={true}
                variableList={data.variables} />
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
            <DeleteProject />
        {/if}
    {/if}
</Container>

{#if teamId}
    <Transfer
        bind:teamId
        teamName={$organizationList.teams.find((t) => t.$id === teamId).name}
        bind:show={showTransfer} />
{/if}
