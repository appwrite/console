<script lang="ts">
    import { goto } from '$app/navigation';
    import { onDestroy, onMount } from 'svelte';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import WizardExitModal from './wizardExitModal.svelte';
    import { isNewWizardStatusOpen, wizard } from '$lib/stores/wizard';

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
              stickySide?: boolean;
              onExit?: () => void;
          }
        | {
              title?: string;
              href?: string;
              confirmExit?: boolean;
              showExitModal?: boolean;
              invertColumns?: boolean;
              hideFooter?: boolean;
              column?: boolean;
              columnSize?: 's' | 'm' | 'l';
              stickySide?: boolean;
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
    export let stickySide: $$Props['stickySide'] = false;
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

    onMount(() => ($isNewWizardStatusOpen = true));

    onDestroy(() => ($isNewWizardStatusOpen = false));
</script>

<svelte:window on:keydown={handleKeydown} />

<Layout.Wizard
    {title}
    {invertColumns}
    {column}
    {columnSize}
    {stickySide}
    {hideFooter}
    href={confirmExit ? null : href}
    buttonMethod={() => {
        if (confirmExit) {
            showExitModal = true;
        } else {
            goto(href);
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
