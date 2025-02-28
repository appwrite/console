<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateVariables from '../../../updateVariables.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import UpdateBuildSettings from './updateBuildSettings.svelte';
    import UpdateTimeout from './updateTimeout.svelte';
    import UpdateRuntimeSettings from './updateRuntimeSettings.svelte';
    import UpdateRepository from './updateRepository.svelte';
    import { onMount } from 'svelte';
    import { showConnectRepo } from './store';
    import UpdateSpa from './updateSPA.svelte';

    export let data;

    const sdkCreateVariable = async (key: string, value: string, secret: boolean) => {
        await sdk.forProject.sites.createVariable($page.params.site, key, value, secret);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    const sdkUpdateVariable = async (
        variableId: string,
        key: string,
        value: string,
        secret: boolean
    ) => {
        await sdk.forProject.sites.updateVariable(
            $page.params.site,
            variableId,
            key,
            value,
            secret
        );
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk.forProject.sites.deleteVariable($page.params.site, variableId);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    onMount(async () => {
        if (
            $page.url.searchParams.has('newInstallation') &&
            $page.url.searchParams.get('newInstallation') === 'true'
        ) {
            showConnectRepo.set(true);
        }
    });

    $: console.log(data);
</script>

<Container>
    <UpdateName site={data.site} />
    <UpdateRepository site={data.site} installations={data.installations} />
    <UpdateBuildSettings site={data.site} frameworks={data.frameworks.frameworks} />
    <UpdateVariables
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        isGlobal={false}
        globalVariableList={data.globalVariables}
        variableList={data.variables}
        product="site" />
    <UpdateTimeout site={data.site} />
    <UpdateSpa site={data.site} />
    <UpdateRuntimeSettings site={data.site} frameworks={data.frameworks.frameworks} />
    <DangerZone site={data.site} />
</Container>
