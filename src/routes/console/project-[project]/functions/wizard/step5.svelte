<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';
    import Variables from '$lib/components/environmentVariables/variables.svelte';

    async function deleteVariable(variableId: string) {
        const index = $createFunction.vars.findIndex((variable) => variable.$id === variableId);
        $createFunction.vars.splice(index, 1);
        $createFunction = $createFunction;
    }

    async function createVariable(key: string, value: string) {
        const index = $createFunction.vars.findIndex((variable) => variable.key === key);

        if (index !== -1) {
            $createFunction.vars[index].key = key;
            $createFunction.vars[index].value = value;
        } else {
            $createFunction.vars.push({ key, value, $id: Date.now().toString() });
        }

        $createFunction = $createFunction;
    }

    async function updateVariable(variableId: string, key: string, value: string) {
        const index = $createFunction.vars.findIndex((variable) => variable.$id === variableId);
        $createFunction.vars[index].key = key;
        $createFunction.vars[index].value = value;
        $createFunction = $createFunction;
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Environment Variables</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Create an environment variable (or secret key) that will be passed to your function at
        runtime and during build.
    </svelte:fragment>

    <Variables
        isWizard={true}
        {deleteVariable}
        {createVariable}
        {updateVariable}
        variables={{ total: $createFunction.vars.length, variables: $createFunction.vars }} />
</WizardStep>
