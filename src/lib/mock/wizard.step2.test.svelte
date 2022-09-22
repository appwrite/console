<script lang="ts">
    import WizardStep from '$lib/layout/wizardStep.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">step-2</svelte:fragment>
    <svelte:fragment slot="subtitle">sub-title-2</svelte:fragment>
    <input data-testid="step-2-first" type="text" />
    <input data-testid="step-2-second" type="text" />
</WizardStep>
