<script lang="ts">
    import { WizardStep } from '$lib/layout';
    // import { createFunction } from './store';
</script>

<WizardStep>
    <svelte:fragment slot="title">Variables (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Create a variable (or secret key) that will be passed to your function at runtime.
    </svelte:fragment>

    EVENT
</WizardStep>
