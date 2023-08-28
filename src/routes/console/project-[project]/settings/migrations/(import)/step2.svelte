<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';

    import ResourceForm from '$routes/console/(migration-wizard)/resource-form.svelte';
    import { formData, provider } from '.';
</script>

<WizardStep>
    <svelte:fragment slot="title">Select data</svelte:fragment>
    <ResourceForm {formData} {provider} projectSdk={sdk.forProject} />
</WizardStep>
