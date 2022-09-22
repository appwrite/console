<script lang="ts">
    import { WizardStep } from '$lib/layout';
    // import { createFunction } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Events (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set the events that will trigger your function. Maximum 100 events allowed.
    </svelte:fragment>

    EVENT
</WizardStep>
