<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { WizardHeader, WizardMainWrapper } from '$lib/layout';
</script>

<WizardMainWrapper>
    <WizardHeader
        title="Create File"
        href={`${base}/console/project-${$page.params.project}/storage/bucket-${$page.params.bucket}`} />

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
