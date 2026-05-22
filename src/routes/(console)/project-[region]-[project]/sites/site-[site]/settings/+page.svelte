<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateName from './updateName.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import UpdateBuildSettings from './updateBuildSettings.svelte';
    import UpdateTimeout from './updateTimeout.svelte';
    import UpdateRuntimeSettings from './updateRuntimeSettings.svelte';
    import UpdateRepository from './updateRepository.svelte';
    import UpdateBuildTriggers from './updateBuildTriggers.svelte';
    import { onMount } from 'svelte';
    import { showConnectRepo } from './store';
    import { isCloud } from '$lib/system';
    import UpdateResourceLimits from './updateResourceLimits.svelte';
    import UpdateVariables from '$routes/(console)/project-[region]-[project]/updateVariables.svelte';
    import UpdateLogging from './updateLogging.svelte';
    import UpdateDeploymentRetention from './updateDeploymentRetention.svelte';
    import { ID } from '@appwrite.io/console';

    export let data;

    const sdkCreateVariable = async (key: string, value: string, secret: boolean) => {
        await sdk.forProject(page.params.region, page.params.project).sites.createVariable({
            siteId: page.params.site,
            variableId: ID.unique(),
            key,
            value,
            secret
        });
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    const sdkUpdateVariable = async (
        variableId: string,
        key: string,
        value: string,
        secret: boolean
    ) => {
        await sdk
            .forProject(page.params.region, page.params.project)
            .sites.updateVariable({ siteId: page.params.site, variableId, key, value, secret });
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk
            .forProject(page.params.region, page.params.project)
            .sites.deleteVariable({ siteId: page.params.site, variableId });
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    const sdkListVariables = async (queries: string[]) =>
        sdk.forProject(page.params.region, page.params.project).sites.listVariables({
            siteId: page.params.site,
            queries
        });

    onMount(async () => {
        if (
            page.url.searchParams.has('newInstallation') &&
            page.url.searchParams.get('newInstallation') === 'true'
        ) {
            showConnectRepo.set(true);
        }
    });
</script>

<Container>
    <UpdateName site={data.site} />
    {#key data.site.providerRepositoryId}
        <UpdateRepository site={data.site} installations={data.installations} />
        <UpdateBuildTriggers site={data.site} />
    {/key}
    <UpdateBuildSettings
        site={data.site}
        frameworks={data.frameworks.frameworks}
        specs={data.specificationsList} />
    <UpdateRuntimeSettings site={data.site} frameworks={data.frameworks.frameworks} />
    <UpdateVariables
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        {sdkListVariables}
        isGlobal={false}
        globalVariableList={data.globalVariables}
        variableList={data.variables}
        backendPagination
        reloadPageOnPagination={false}
        variablesOffset={data.variablesOffset}
        variablesLimit={data.limit}
        project={data.project}
        product="site"
        analyticsSource="site_settings" />
    {#if isCloud}
        <UpdateResourceLimits site={data.site} specs={data.specificationsList} />
    {/if}
    <UpdateDeploymentRetention site={data.site} />
    <UpdateTimeout site={data.site} />
    <UpdateLogging site={data.site} />
    <DangerZone site={data.site} />
</Container>
