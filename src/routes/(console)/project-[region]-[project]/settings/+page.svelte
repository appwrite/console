<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { ID } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { project } from '../store';
    import { Container } from '$lib/layout';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import UpdateName from './updateName.svelte';
    import UpdateProtocols from './updateProtocols.svelte';
    import UpdateServices from './updateServices.svelte';
    import UpdateInstallations from './updateInstallations.svelte';
    import DeleteProject from './deleteProject.svelte';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { canWriteProjects } from '$lib/stores/roles';
    import ChangeOrganization from './changeOrganization.svelte';
    import UpdateVariables from '../updateVariables.svelte';
    import { page } from '$app/state';
    import UpdateLabels from './updateLabels.svelte';
    import PremiumGeoDB from './premiumGeoDB.svelte';
    import { isCloud } from '$lib/system';
    import type { PageData } from './$types';
    import { Alert } from '@appwrite.io/pink-svelte';

    let { data }: { data: PageData } = $props();

    onMount(() => {
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
            .projectApi.createVariable({ variableId: ID.unique(), key, value, secret });
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
            .projectApi.updateVariable({ variableId, key, value, secret });
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }

    async function sdkDeleteVariable(variableId: string) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .projectApi.deleteVariable({ variableId });
        await invalidate(Dependencies.PROJECT_VARIABLES);
    }
</script>

<Container>
    {#if $project}
        {#if !$canWriteProjects}
            <Alert.Inline status="info" title="Read-only project settings">
                You can open this settings area, but editing project-level settings requires the
                <code>projects.write</code> scope.
            </Alert.Inline>
        {/if}

        <UpdateName />
        <UpdateLabels />
        <UpdateProtocols />
        <UpdateServices />
        <UpdateInstallations {...data.installations} limit={data.limit} offset={data.offset} />
        {#if isCloud && $canWriteProjects}
            <PremiumGeoDB addons={data.addons} addonPrice={data.addonPrice} />
        {/if}
        <UpdateVariables
            {sdkCreateVariable}
            {sdkUpdateVariable}
            {sdkDeleteVariable}
            disabled={!$canWriteProjects}
            isGlobal
            variableList={data.variables}
            backendPagination
            variablesOffset={data.variablesOffset}
            variablesLimit={data.limit}
            project={data.project}
            analyticsSource="project_settings" />
        <ChangeOrganization />
        <DeleteProject />
    {/if}
</Container>
