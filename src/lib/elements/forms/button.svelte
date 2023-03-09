<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { getContext, hasContext } from 'svelte';
    import type { FormContext } from './form.svelte';

    export let submit = false;
    export let secondary = false;
    export let text = false;
    export let danger = false;
    export let disabled = false;
    export let round = false;
    export let external = false;
    export let href: string = null;
    export let fullWidth = false;
    export let ariaLabel: string = null;
    export let noMargin = false;
    export let event: string = null;

    //allows to add the disabled attribute to <a> tag without throwing an error
    let attributes = { disabled } as Record<string, boolean>;

    let formDisabled = false;

    if (submit) {
        if (hasContext('form')) {
            const { isSubmitting } = getContext<FormContext>('form');

            isSubmitting.subscribe((value) => {
                formDisabled = value;
            });
        }
    }

    $: actualDisabled = formDisabled || disabled;

    function track() {
        if (!event) {
            return;
        }

        trackEvent(`click_${event}`, {
            from: 'button'
        });
    }
</script>

{#if href}
    <a
        on:click={track}
        {...attributes}
        {href}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}
        class="button"
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-text={text}
        class:is-danger={danger}
        class:is-full-width={fullWidth}
        class:u-padding-inline-0={noMargin}
        aria-label={ariaLabel}>
        <slot />
    </a>
{:else}
    <button
        on:click
        on:click={track}
        disabled={actualDisabled}
        class="button"
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-danger={danger}
        class:is-text={text}
        class:is-full-width={fullWidth}
        class:u-padding-inline-0={noMargin}
        type={submit ? 'submit' : 'button'}
        aria-label={ariaLabel}>
        <slot />
    </button>
{/if}
