<script lang="ts">
    import { WizardStep } from '$lib/layout';

    import { formData, provider } from '.';
    import ResourceForm from './resource-form.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">Select data</svelte:fragment>
    <ResourceForm {provider} {formData} />
</WizardStep>
