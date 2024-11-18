<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateVariables from '../../../updateVariables.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { Heading } from '$lib/components';
    import { page } from '$app/stores';

    export let data;

    const sdkCreateVariable = async (key: string, value: string) => {
        await sdk.forProject.sites.createVariable($page.params.site, key, value);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    const sdkUpdateVariable = async (variableId: string, key: string, value: string) => {
        await sdk.forProject.sites.updateVariable($page.params.site, variableId, key, value);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk.forProject.sites.deleteVariable($page.params.site, variableId);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.SITE)]);
    };
</script>

<Container>
    <Heading tag="h2" size="5">Settings</Heading>
    <UpdateName site={data.site} />
    <UpdateVariables
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        isGlobal={false}
        globalVariableList={data.globalVariables}
        variableList={data.variables} />
    <DangerZone site={data.site} />
</Container>
