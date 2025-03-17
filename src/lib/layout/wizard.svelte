<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import WizardExitModal from './wizardExitModal.svelte';
    import { goto } from '$app/navigation';
    import { wizard } from '$lib/stores/wizard';

    type $$Props =
        | {
              title?: string;
              confirmExit: boolean;
              showExitModal: boolean;
              href?: string;
              invertColumns?: boolean;
              hideFooter?: boolean;
              column?: boolean;
              columnSize?: 's' | 'm' | 'l';
              onExit?: () => void;
          }
        | {
              title?: string;
              href: string;
              confirmExit?: boolean;
              showExitModal?: boolean;
              invertColumns?: boolean;
              hideFooter?: boolean;
              column?: boolean;
              columnSize?: 's' | 'm' | 'l';
              onExit?: () => void;
          };

    export let title: $$Props['title'] = '';
    export let confirmExit: $$Props['confirmExit'] = false;
    export let href: $$Props['href'] = '';
    export let showExitModal: $$Props['showExitModal'] = false;
    export let invertColumns: $$Props['invertColumns'] = false;
    export let hideFooter = false;
    export let column: $$Props['column'] = false;
    export let columnSize: $$Props['columnSize'] = 'm';
    export let onExit: $$Props['onExit'] = undefined;

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

<div class="wizard-position">
    <Layout.Wizard
        {title}
        {invertColumns}
        {column}
        {columnSize}
        {hideFooter}
        href={confirmExit ? null : href}
        buttonMethod={() => {
            if (confirmExit) {
                showExitModal = true;
            } else {
                trackEvent('wizard_exit', {
                    from: 'button'
                });
            }
        }}>
        <slot />
        <svelte:fragment slot="aside">
            <slot name="aside" />
        </svelte:fragment>
        <svelte:fragment slot="footer">
            <slot name="footer" />
        </svelte:fragment>
    </Layout.Wizard>
</div>

{#if showExitModal}
    <WizardExitModal
        {href}
        bind:show={showExitModal}
        on:exit={() => {
            trackEvent('wizard_exit', {
                from: 'prompt'
            });

            wizard.hide();
            if (onExit) {
                onExit();

                // clear exit
                onExit = null;
            }
        }}>
        <slot name="exit">
            Are you sure you want to exit from this process? All data will be deleted. This action
            is irreversible.
        </slot>
    </WizardExitModal>
{/if}

<style lang="scss">
    .wizard-position {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 50;
        width: 100%;
        height: 100%;
        max-height: 100dvh;
        overflow-y: auto;
    }

    // :global(html) {
    //     overflow-y: hidden;
    // }
</style>
