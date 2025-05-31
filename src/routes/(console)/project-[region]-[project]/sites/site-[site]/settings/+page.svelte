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
    import { onMount } from 'svelte';
    import { showConnectRepo } from './store';
    import { isCloud } from '$lib/system';
    import UpdateResourceLimits from './updateResourceLimits.svelte';
    import UpdateVariables from '$routes/(console)/project-[region]-[project]/updateVariables.svelte';
    import UpdateLogging from './updateLogging.svelte';

    export let data;

    const sdkCreateVariable = async (key: string, value: string, secret: boolean) => {
        await sdk
            .forProject(page.params.region, page.params.project)
            .sites.createVariable(page.params.site, key, value, secret);
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
            .sites.updateVariable(page.params.site, variableId, key, value, secret);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk
            .forProject(page.params.region, page.params.project)
            .sites.deleteVariable(page.params.site, variableId);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

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
    {/key}
    <UpdateBuildSettings site={data.site} frameworks={data.frameworks.frameworks} />
    <UpdateRuntimeSettings site={data.site} frameworks={data.frameworks.frameworks} />
    <UpdateVariables
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        isGlobal={false}
        globalVariableList={data.globalVariables}
        variableList={data.variables}
        product="site"
        analyticsSource="site_settings" />
    {#if isCloud}
        <UpdateResourceLimits site={data.site} specs={data.specificationsList} />
    {/if}
    <UpdateTimeout site={data.site} />
    <UpdateLogging site={data.site} />
    <DangerZone site={data.site} />
</Container>
