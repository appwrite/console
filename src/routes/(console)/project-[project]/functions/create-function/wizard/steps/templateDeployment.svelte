<script lang="ts">
    import { LabelCard } from '$lib/components';
    import { FormList } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { consoleVariables } from '$routes/(console)/store';
    import { onMount } from 'svelte';
    import { templateConfig, templateStepsComponents } from '../../store';

    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;

    onMount(() => {
        if (!isVcsEnabled) {
            $templateConfig.repositoryBehaviour = 'manual';
        }
    });

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

    <h3>Connect with Git <span class="inline-code">Recommended</span></h3>
    <FormList gap={16} class="u-margin-block-start-8">
        <LabelCard
            name="behaviour"
            value="new"
            bind:group={$templateConfig.repositoryBehaviour}
            disabled={!isVcsEnabled}>
            <svelte:fragment slot="title">Create a new repository</svelte:fragment>
            Clone the template to a newly created repository in your organization.
        </LabelCard>
        <LabelCard
            name="behaviour"
            value="existing"
            bind:group={$templateConfig.repositoryBehaviour}
            disabled={!isVcsEnabled}>
            <svelte:fragment slot="title">Add to existing repository</svelte:fragment>
            Clone the template to an existing repository in your organization.
        </LabelCard>

        <h3>Quick start</h3>
        <LabelCard name="behaviour" value="manual" bind:group={$templateConfig.repositoryBehaviour}>
            <svelte:fragment slot="title">Connect later</svelte:fragment>
            Deploy now and continue development via CLI, or connect Git from your function settings.
        </LabelCard>
    </FormList>
</WizardStep>
