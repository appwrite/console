<script lang="ts">
    import { page } from '$app/stores';
    import { WizardStep } from '$lib/layout';
    import { CopyInput } from '$lib/components';
    import { FormList } from '$lib/elements/forms';
    import { getProjectEndpoint } from '$lib/helpers/project';

    const project = $page.params.project;
</script>

<WizardStep>
    <svelte:fragment slot="title">All set! Your project is ready to go</svelte:fragment>
    <FormList gap={16}>
        <p>
            You've successfully added a platform to your project. Access Appwrite services using
            this project's API Endpoint and Project ID:
        </p>

        <CopyInput label="API Endpoint" showLabel={true} value={getProjectEndpoint()} />
        <CopyInput label="Project ID" showLabel={true} value={project} />
    </FormList>
</WizardStep>
