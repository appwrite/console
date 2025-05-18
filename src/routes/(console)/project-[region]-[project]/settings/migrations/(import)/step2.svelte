<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import ResourceForm from '$routes/(console)/(migration-wizard)/resource-form.svelte';
    import { formData, provider } from '.';
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
    <ResourceForm
        {formData}
        {provider}
        projectSdk={sdk.forProject(page.params.region, page.params.project)} />
</WizardStep>
