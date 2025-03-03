<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import WizardExitModal from './wizardExitModal.svelte';
    import { goto } from '$app/navigation';
    import { Typography } from '@appwrite.io/pink-svelte';

    type $$Props =
        | {
              confirmExit: boolean;
              showExitModal: boolean;
              href?: string;
          }
        | {
              confirmExit?: boolean;
              showExitModal?: boolean;
              href: string;
          };

    export let confirmExit: $$Props['confirmExit'] = false;
    export let href: $$Props['href'] = '';
    export let showExitModal: $$Props['showExitModal'] = false;

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            if (confirmExit) {
                showExitModal = true;
            } else {
                goto(href);
                trackEvent('wizard_exit', {
                    from: 'escape'
                });
            }
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<section class="wizard-secondary c-wizard-position">
    <div class="wizard-secondary-container">
        <header class="wizard-secondary-header">
            <div class="u-flex u-main-space-between u-gap-32 u-cross-center">
                <Typography.Title><slot name="title" /></Typography.Title>

                <Button
                    text
                    icon
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

        <slot />
    </div>
</section>

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

<style lang="scss">
    .c-wizard-position {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 30;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        overflow-y: auto;
    }
</style>
