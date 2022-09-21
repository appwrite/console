<script lang="ts">
    import WizardStep from '$lib/layout/wizardStep.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">step-1</svelte:fragment>
    <svelte:fragment slot="subtitle">sub-title-1</svelte:fragment>
    <input name="step-1-required" required data-testid="step-1-required" type="text" />
    <input name="step-1-optional" data-testid="step-1-optional" type="text" />
</WizardStep>
