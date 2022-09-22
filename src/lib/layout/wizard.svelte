<script context="module" lang="ts">
    export type WizardStepsType = Map<
        number,
        {
            label: string;
            component: typeof SvelteComponent;
        }
    >;
</script>

<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Steps } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import { createEventDispatcher, type SvelteComponent } from 'svelte';

    export let title: string;
    export let steps: WizardStepsType;
    export let finalAction = 'Create';

    const dispatch = createEventDispatcher();

    let currentStep = 1;

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            wizard.hide();
        }
    }

    function submit() {
        if (isLastStep) {
            dispatch('finish');
        } else {
            currentStep++;
        }
    }

    $: sortedSteps = [...steps].sort(([a], [b]) => (a > b ? 1 : -1));
    $: isLastStep = currentStep === steps.size;

    beforeNavigate(() => {
        wizard.hide();
    });
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="wizard">
    <div class="wizard-header-strip" />
    <div class="wizard-start-bg" />
    <div class="wizard-end-bg" />

    <header class="wizard-header">
        <div class="body-text-1">{title}</div>

        <slot name="header" />
        <button class="x-button" aria-label="close wizard" on:click={wizard.hide}>
            <span class="icon-x" aria-hidden="true" />
        </button>
    </header>

    <aside class="wizard-side">
        <Steps
            steps={sortedSteps.map(([, { label }]) => ({
                text: label
            }))}
            {currentStep} />
    </aside>
    <div class="wizard-media">
        <slot name="media" />
    </div>
    <div class="wizard-main">
        <Form on:submit={submit}>
            {#each sortedSteps as [step, { component }]}
                {#if currentStep === step}
                    <svelte:component this={component} />
                {/if}
            {/each}
            <div class="form-footer">
                <div class="u-flex u-main-end u-gap-12">
                    {#if currentStep === 1}
                        <Button secondary on:click={wizard.hide}>Cancel</Button>
                        <Button submit>Next</Button>
                    {:else if isLastStep}
                        <Button secondary on:click={() => currentStep--}>Back</Button>
                        <Button submit>{finalAction}</Button>
                    {:else}
                        <Button secondary on:click={() => currentStep--}>Back</Button>
                        <Button submit>Next</Button>
                    {/if}
                </div>
            </div>
        </Form>
    </div>
</section>
