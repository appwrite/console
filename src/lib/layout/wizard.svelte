<script context="module" lang="ts">
    export type WizardStepsType = Map<
        number,
        {
            label: string;
            component: typeof SvelteComponent;
            optional?: boolean;
        }
    >;
</script>

<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';

    import { Steps } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import { createEventDispatcher, type SvelteComponent } from 'svelte';
    import WizardExitModal from './wizardExitModal.svelte';

    export let title: string;
    export let steps: WizardStepsType;
    export let confirmExit = false;
    export let finalAction = 'Create';

    const dispatch = createEventDispatcher();

    let currentStep = 1;
    let showExitModal = false;

    function handleKeydown(event: KeyboardEvent) {
        const openDialog = document.querySelectorAll('dialog[open]');
        if (event.key === 'Escape' && !showExitModal && !openDialog?.length) {
            event.preventDefault();
            trackEvent('wizard_exit', {
                from: 'escape'
            });
            dispatch('exit');
            wizard.hide();
        }
    }

    function handleExit() {
        if (confirmExit) {
            showExitModal = true;
        } else {
            trackEvent('wizard_exit', {
                from: 'button'
            });
            dispatch('exit');
            wizard.hide();
        }
    }

    function handleStepClick(e: CustomEvent<number>) {
        const step = e.detail;
        if (step < currentStep) {
            currentStep = step;
        }
    }

    async function submit() {
        if ($wizard.interceptor) {
            try {
                await $wizard.interceptor();
            } catch (error) {
                addNotification({
                    message: error.message,
                    type: 'error'
                });
                return;
            }
        }

        wizard.setInterceptor(null);
        if (isLastStep) {
            trackEvent('wizard_finish');
            dispatch('finish');
        } else {
            trackEvent('wizard_next');
            currentStep++;
        }
    }

    $: sortedSteps = [...steps].sort(([a], [b]) => (a > b ? 1 : -1));
    $: isLastStep = currentStep === steps.size;
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="wizard">
    <div class="wizard-header-strip" />
    <div class="wizard-start-bg" />
    <div class="wizard-end-bg" />

    <header class="wizard-header">
        <div class="body-text-1 u-bold">{title}</div>

        <slot name="header" />
        <button
            class="button is-text is-only-icon u-margin-inline-start-auto"
            style="--button-size:1.5rem;"
            aria-label="close wizard"
            on:click={handleExit}>
            <span class="icon-x" aria-hidden="true" />
        </button>
    </header>

    <aside class="wizard-side">
        <slot name="aside">
            <Steps
                on:step={handleStepClick}
                steps={sortedSteps.map(([, { label, optional }]) => ({
                    text: label,
                    optional
                }))}
                {currentStep} />
        </slot>
    </aside>
    <div class="wizard-media">
        {#if $wizard.media}
            <img src={$wizard.media} alt="wizard media" loading="lazy" />
        {/if}
    </div>
    <div class="wizard-main">
        <Form noStyle onSubmit={submit}>
            {#each sortedSteps as [step, { component }]}
                {#if currentStep === step}
                    <svelte:component this={component} />
                {/if}
            {/each}
            <div class="form-footer">
                <div class="u-flex u-main-end u-gap-12">
                    {#if !isLastStep && sortedSteps[currentStep - 1][1].optional}
                        <Button text on:click={() => dispatch('finish')}>
                            Skip optional steps
                        </Button>
                    {/if}
                    {#if currentStep === 1}
                        <Button secondary on:click={handleExit}>Cancel</Button>
                        <Button submit>Next</Button>
                    {:else if isLastStep}
                        <Button
                            secondary
                            on:click={() => currentStep--}
                            on:click={() => trackEvent('wizard_back')}>Back</Button>
                        <Button submit>{finalAction}</Button>
                    {:else}
                        <Button
                            secondary
                            on:click={() => currentStep--}
                            on:click={() => trackEvent('wizard_back')}>Back</Button>
                        <Button submit>Next</Button>
                    {/if}
                </div>
            </div>
        </Form>
    </div>
</section>

{#if showExitModal}
    <WizardExitModal
        bind:show={showExitModal}
        on:exit={() => {
            trackEvent('wizard_exit', {
                from: 'prompt'
            });
            wizard.hide();
        }}>
        <slot name="exit">this process</slot>
    </WizardExitModal>
{/if}
