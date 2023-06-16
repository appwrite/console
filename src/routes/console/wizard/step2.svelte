<script lang="ts">
    import { RegionCard } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createOrganization } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Select region</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose a deployment region for your project. This region cannot be changed.
    </svelte:fragment>

    <p class="text u-margin-block-start-16">
        Edge Network is enabled on all regions. For more details, check out our <a
            class="link"
            href="http://#"
            target="_blank"
            rel="noopener noreferrer">Documentation</a
        >.
    </p>
</WizardStep>
