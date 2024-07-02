<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';

    type $$Props =
        | {
              confirmExit: boolean;
              href?: string;
          }
        | {
              confirmExit?: boolean;
              href: string;
          };

    export let confirmExit: $$Props['confirmExit'] = false;
    export let href: $$Props['href'] = '';

    const dispatch = createEventDispatcher();
</script>

<header class="wizard-secondary-header">
    <div class="u-flex u-main-space-between u-gap-32 u-cross-center">
        <Heading size={5} tag="h1"><slot /></Heading>
        <Button
            text
            round
            ariaLabel="close modal"
            href={confirmExit ? null : href}
            on:click={() => {
                if (confirmExit) {
                    dispatch('exit');
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
