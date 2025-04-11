<script context="module" lang="ts">
    export type WizardStepsType = Map<
        number,
        {
            label: string;
            component: typeof SvelteComponent<unknown>;
            optional?: boolean;
            disabled?: boolean;
            actions?: {
                label: string;
                onClick: () => Promise<void>;
            }[];
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
    export let finalMethod: () => Promise<void> = null;

    // If the parent layout manages hiding the wizard via dispatched `exit` events,
    // the wizard won't hide automatically when `manualExitControl` is true. Handle it manually.
    export let manualExitControl = false;

    const dispatch = createEventDispatcher();

    let showExitModal = false;

    function handleKeydown(event: KeyboardEvent) {
        const openDialog = document.querySelectorAll('dialog[open]');
        if (event.key === 'Escape' && !showExitModal && !openDialog?.length) {
            event.preventDefault();
            trackEvent('wizard_exit', {
                from: 'escape'
            });

            dispatch('exit', { optional: steps.get($wizard.step).optional });
            if (!manualExitControl) wizard.hide();
        }
    }

    function handleExit() {
        if (confirmExit) {
            showExitModal = true;
        } else {
            trackEvent('wizard_exit', {
                from: 'button'
            });
            dispatch('exit', { optional: steps.get($wizard.step).optional });
            if (!manualExitControl) wizard.hide();
        }
    }

    function handleStepClick(e: CustomEvent<number>) {
        const step = e.detail;
        if (step < $wizard.step) {
            $wizard.step = step;
            // clear the interceptor
            wizard.setInterceptor(null);
        }
    }

    async function submit() {
        if ($wizard.interceptor) {
            $wizard.nextDisabled = true;
            try {
                await $wizard.interceptor();
            } catch (error) {
                if (!$wizard.interceptorNotificationEnabled) return;
                addNotification({
                    message: error.message,
                    type: 'error'
                });
                return;
            } finally {
                $wizard.nextDisabled = false;
            }
        }

        wizard.setInterceptor(null);
        if (isLastStep) {
            if ($wizard.finalAction) {
                $wizard.nextDisabled = true;
                try {
                    await $wizard.finalAction();
                    trackEvent('wizard_finish');
                } catch (error) {
                    addNotification({
                        message: error.message,
                        type: 'error'
                    });
                } finally {
                    $wizard.nextDisabled = false;
                }
            } else {
                $wizard.nextDisabled = true;
                if (finalMethod) {
                    await finalMethod();
                    trackEvent('wizard_finish');
                    $wizard.nextDisabled = false;
                } else {
                    trackEvent('wizard_finish');
                    dispatch('finish');

                    setTimeout(() => {
                        $wizard.nextDisabled = false;
                    }, 2000);
                }
            }
        } else {
            if (steps.get($wizard.step + 1)?.disabled) {
                $wizard.step++;
                while (steps.get($wizard.step)?.disabled) {
                    $wizard.step++;
                }
            } else {
                $wizard.step++;
            }
            trackEvent('wizard_next');
        }
    }

    function previousStep() {
        if (steps.get($wizard.step - 1)?.disabled) {
            $wizard.step--;
            while (steps.get($wizard.step)?.disabled) {
                $wizard.step--;
            }
        } else {
            $wizard.step--;
        }
        wizard.setInterceptor(null);
        trackEvent('wizard_back');
    }

    $: sortedSteps = [...steps].sort(([a], [b]) => (a > b ? 1 : -1));
    $: isLastStep = (() => {
        if ($wizard.step === steps.size) {
            return true;
        }
        let lastStep = true;
        steps.forEach((step, i) => {
            if (i > $wizard.step && !step.disabled) {
                lastStep = false;
            }
        });
        return lastStep;
    })();
    $: currentStep = steps.get($wizard.step);
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
                steps={sortedSteps.map(([, { label, optional, disabled }]) => ({
                    text: label,
                    optional,
                    disabled
                }))}
                currentStep={$wizard.step} />
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
                {#if $wizard.step === step}
                    <svelte:component this={component} />
                {/if}
            {/each}
            <div class="u-z-index-5 form-footer">
                <div class="u-flex u-main-end u-gap-12">
                    {#if !isLastStep && currentStep?.optional}
                        <Button text on:click={() => dispatch('finish', { skipped: true })}>
                            Skip optional steps
                        </Button>
                    {/if}

                    {#if $wizard.step === 1}
                        <Button secondary on:click={handleExit}>Cancel</Button>
                    {:else}
                        <Button secondary on:click={previousStep}>Back</Button>
                    {/if}

                    {#if currentStep?.actions}
                        {#each currentStep.actions as action}
                            <Button secondary on:click={action.onClick}>
                                {action.label}</Button>
                        {/each}
                    {/if}

                    <Button submit disabled={$wizard.nextDisabled}>
                        {isLastStep ? finalAction : 'Next'}
                    </Button>
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
