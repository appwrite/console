<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { formData, provider, selectedProject } from '.';
    import ResourceForm from './resource-form.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">Resources</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Select the resources you need to migrate to Appwrite. Some resources can be migrated, but
        with limitations. <a
            class="link"
            href="https://appwrite.io/docs/advanced/migrations"
            target="_blank"
            rel="noopener noreferrer">
            Learn about which resources are supported</a
        >.
    </svelte:fragment>
    <ResourceForm {provider} {formData} projectSdk={sdk.forProject('fra1', $selectedProject)} />
</WizardStep>
