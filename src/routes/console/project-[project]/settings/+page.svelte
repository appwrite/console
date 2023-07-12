<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '../store';
    import { services } from '$lib/stores/project-services';
    import { Container } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import type { PageData } from './$types';
    import UpdateName from './updateName.svelte';
    import UpdateServices from './updateServices.svelte';
    import UpdateInstallations from './updateInstallations.svelte';
    import UpdateVariables from '../updateVariables.svelte';
    import DeleteProject from './deleteProject.svelte';

    export let data: PageData;

    onMount(() => {
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

    $: services.load($project);
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
    {/if}
</Container>
