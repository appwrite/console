<script lang="ts">
    import { page } from '$app/stores';
    import { WizardStep } from '$lib/layout';
    import { CopyInput } from '$lib/components';
    import { FormList } from '$lib/elements/forms';
    import { getProjectEndpoint } from '$lib/helpers/project';

    const project = $page.params.project;
    $: isFirstProject = $page.data.platforms.total === 0;
</script>

<WizardStep>
    <svelte:fragment slot="title">All set! Your project is ready to go</svelte:fragment>
    <FormList gap={16}>
        <p>
            {#if isFirstProject}
                Congratulations on adding the first platform to your project!
            {:else}
                Congratulations on adding another platform to your project!
            {/if}

            Use the Project ID and API endpoint in your project to get started:
        </p>

        <CopyInput label="Project ID" showLabel={true} value={project} />
        <CopyInput label="Endpoint" showLabel={true} value={getProjectEndpoint()} />
    </FormList>
</WizardStep>
