<script lang="ts">
    import { LabelCard } from '$lib/components';
    import { FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { templateConfig, templateStepsComponents } from '../store';

    async function beforeSubmit() {
        if (!$templateConfig.repositoryBehaviour) {
            throw new Error('Please select repository behaviour.');
        }
    }

    $: if ($templateConfig.repositoryBehaviour === 'manual') {
        $templateStepsComponents.get(5).disabled = true;
        $templateStepsComponents.get(6).disabled = true;
        $templateStepsComponents = $templateStepsComponents;
    } else {
        $templateStepsComponents.get(5).disabled = false;
        $templateStepsComponents.get(6).disabled = false;
        $templateStepsComponents = $templateStepsComponents;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Deployment</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Connect your function to a Git repository for automatic deployments or deploy your function
        using CLI.
    </svelte:fragment>

    <h3>Automatic with Git <span class="inline-code">Recommended</span></h3>
    <FormList gap={16} class="u-margin-block-start-8">
        <LabelCard name="behaviour" value="new" bind:group={$templateConfig.repositoryBehaviour}>
            <svelte:fragment slot="title">Create a new repository</svelte:fragment>
            Clone the template to a newly created repository in your organization.
        </LabelCard>
        <LabelCard
            name="behaviour"
            value="existing"
            bind:group={$templateConfig.repositoryBehaviour}>
            <svelte:fragment slot="title">Add to existing repository</svelte:fragment>
            Clone the template to an existing repository in your organization.
        </LabelCard>
    </FormList>

    <h3 class="u-margin-block-start-24">Manual with CLI</h3>
    <ul class="u-margin-block-start-8">
        <LabelCard name="behaviour" value="manual" bind:group={$templateConfig.repositoryBehaviour}>
            <svelte:fragment slot="title">Create manually</svelte:fragment>
            Deploy a function from a template and change the code using the CLI.
        </LabelCard>
    </ul>
</WizardStep>
