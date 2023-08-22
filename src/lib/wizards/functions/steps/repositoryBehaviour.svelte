<script lang="ts">
    import { LabelCard } from '$lib/components';
    import { WizardStep } from '$lib/layout';
    import { templateConfig } from '../store';

    async function beforeSubmit() {
        if (!$templateConfig.repositoryBehaviour) {
            throw new Error('Please select repository behaviour.');
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Connect</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Connect function to a new repository or to an existing one within a selected Git
        organization.
    </svelte:fragment>

    <ul class="u-flex u-flex-vertical u-gap-24">
        <LabelCard name="behaviour" value="new" bind:group={$templateConfig.repositoryBehaviour}>
            <svelte:fragment slot="title">Create a new repository</svelte:fragment>
            Clone the template and create a new repository in your selected organization.
        </LabelCard>
        <LabelCard
            name="behaviour"
            value="existing"
            bind:group={$templateConfig.repositoryBehaviour}>
            <svelte:fragment slot="title">Add to existing repository</svelte:fragment>
            Clone the template to an existing repository in your selected organization.
        </LabelCard>
    </ul>
</WizardStep>
