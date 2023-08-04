<script lang="ts">
    import LL from '$i18n/i18n-svelte';
    import { InputText } from '$lib/elements/forms';
    import WizardStep from '$lib/layout/wizardStep.svelte';
</script>

<WizardStep>
    <svelte:fragment slot="title">{$LL.console.project.mock.title.stepTwo()}</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >{$LL.console.project.mock.title.stepStepTwo()}</svelte:fragment>
    <InputText label={$LL.console.project.mock.inputs.label.stepTwoFirst()} id="step-2-first" />
    <InputText label={$LL.console.project.mock.inputs.label.stepTwoSecond()} id="step-2-second" />
</WizardStep>
