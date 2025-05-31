<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '../store';
    import { Container } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import UpdateName from './updateName.svelte';
    import UpdateServices from './updateServices.svelte';
    import UpdateInstallations from './updateInstallations.svelte';
    import DeleteProject from './deleteProject.svelte';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { canWriteProjects } from '$lib/stores/roles';
    import ChangeOrganization from './changeOrganization.svelte';
    import UpdateVariables from '../updateVariables.svelte';
    import { page } from '$app/state';

    export let data;

    let teamId: string = null;

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

    async function sdkCreateVariable(key: string, value: string, secret: boolean) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .projectApi.createVariable(key, value, secret);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }

    async function sdkUpdateVariable(
        variableId: string,
        key: string,
        value: string,
        secret: boolean
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .projectApi.updateVariable(variableId, key, value, secret);
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }

    async function sdkDeleteVariable(variableId: string) {
        await sdk
            .forProject(page.params.region, page.params.project)
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
                variableList={data.variables}
                analyticsSource="project_settings" />
            <ChangeOrganization />
            <DeleteProject />
        {/if}
    {/if}
</Container>
