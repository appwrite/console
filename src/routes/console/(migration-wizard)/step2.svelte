<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { getSdkForProject } from '$lib/stores/sdk';

    import { formData, provider, selectedProject } from '.';
    import ResourceForm from './resource-form.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">Select data</svelte:fragment>
    <ResourceForm {provider} {formData} projectSdk={getSdkForProject($selectedProject)} />
</WizardStep>
