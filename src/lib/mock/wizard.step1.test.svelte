<script lang="ts">
    import LL from '$i18n/i18n-svelte';
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
    <svelte:fragment slot="title">{$LL.console.project.mock.title.stepOne()}</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >{$LL.console.project.mock.title.stepStepOne()}</svelte:fragment>
    <InputText
        label={$LL.console.project.mock.inputs.label.stepOneFirst()}
        id="step-1-required"
        required
        maxlength={12}
        bind:value />
    <InputText label={$LL.console.project.mock.inputs.label.stepOneSecond()} id="step-1-optional" />
</WizardStep>
