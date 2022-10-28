<script lang="ts">
    import InputText from '$lib/elements/forms/inputText.svelte';
    import WizardStep from '$lib/layout/wizardStep.svelte';

    let value: string = null;

    async function beforeSubmit() {
        if (value === 'fail') {
            throw new Error('failed');
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">step-1</svelte:fragment>
    <svelte:fragment slot="subtitle">sub-title-1</svelte:fragment>
    <InputText label="step-1-required" id="step-1-required" required maxlength={12} bind:value />
    <InputText label="step-1-optional" id="step-1-optional" />
</WizardStep>
