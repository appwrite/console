<script lang="ts">
    import { InputText } from '$lib/elements/forms';
    import WizardStep from '$lib/layout/wizardStep.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">step-2</svelte:fragment>
    <svelte:fragment slot="subtitle">sub-title-2</svelte:fragment>
    <InputText label="step-2-first" id="step-2-first" />
    <InputText label="step-2-second" id="step-2-second" />
</WizardStep>
