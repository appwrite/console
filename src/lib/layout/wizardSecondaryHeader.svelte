<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import WizardExitModal from './wizardExitModal.svelte';

    export let showExitModal = false;
    export let confirmExit = false;
    export let href: string;
</script>

<header class="wizard-secondary-header">
    <div class="u-flex u-main-space-between u-gap-32 u-cross-center">
        <Heading size={5} tag="h1"><slot /></Heading>
        <Button
            text
            round
            class="u-margin-block-start-8"
            ariaLabel="close modal"
            href={confirmExit ? null : href}
            on:click={() => {
                if (confirmExit) {
                    showExitModal = true;
                } else {
                    trackEvent('wizard_exit', {
                        from: 'button'
                    });
                }
            }}>
            <span class="icon-x u-font-size-20" aria-hidden="true"></span>
        </Button>
    </div>
    {#if $$slots.description}
        <p class="body-text-2"><slot name="description" /></p>
    {/if}
</header>

{#if showExitModal}
    <WizardExitModal
        {href}
        bind:show={showExitModal}
        on:exit={() => {
            trackEvent('wizard_exit', {
                from: 'prompt'
            });
        }}>
        <slot name="exit">
            Are you sure you want to exit from this process? All data will be deleted. This action
            is irreversible.
        </slot>
    </WizardExitModal>
{/if}
