<script lang="ts">
    import CardGrid from '$lib/components/cardGrid.svelte';
    import Variables from '$lib/components/environmentVariables/variables.svelte';
    import Heading from '$lib/components/heading.svelte';
    import Container from '$lib/layout/container.svelte';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { PageData } from './$types';

    export let data: PageData;

    async function deleteVariable(variableId: string) {
        await sdkForProject.project.deleteVariable(variableId);
    }

    async function createVariable(key: string, value: string) {
        await sdkForProject.project.createVariable(key, value);
    }

    async function updateVariable(variableId: string, key: string, value: string) {
        await sdkForProject.project.updateVariable(variableId, key, value);
    }
</script>

<Container>
    <CardGrid>
        <Heading tag="h6" size="7">Update Shared Environment Variables</Heading>
        <p>Set the environment variables (or secret keys) that will be passed to all resources.</p>

        <svelte:fragment slot="aside">
            <Variables
                isShared={true}
                variables={data.variables}
                {deleteVariable}
                {createVariable}
                {updateVariable} />
        </svelte:fragment>
    </CardGrid>
</Container>
