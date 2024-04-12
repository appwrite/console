<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { WizardHeader, WizardMainWrapper } from '$lib/layout';

    function handleExit() {
        console.log('test');
    }

    let previousPage: string = base;
    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    $: console.log(previousPage);
</script>

<WizardMainWrapper>
    <WizardHeader title={$page.data.wizardTitle} on:click={handleExit} />

    <!-- <aside class="wizard-side">
        <slot name="aside">
            <Steps
                on:step={handleStepClick}
                steps={sortedSteps.map(([, { label, optional, disabled }]) => ({
                    text: label,
                    optional,
                    disabled
                }))}
                currentStep={$wizard.step} />
        </slot>
    </aside> -->

    <div class="wizard-main">
        <slot />
    </div>
</WizardMainWrapper>
