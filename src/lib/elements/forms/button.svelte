<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { getContext, hasContext } from 'svelte';
    import { readable } from 'svelte/store';
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
    let classes: string = undefined;
    export { classes as class };

    const isSubmitting = hasContext('form')
        ? getContext<FormContext>('form').isSubmitting
        : readable(false);

    $: internalDisabled = (submit && $isSubmitting) || disabled;

    function track() {
        if (!event) {
            return;
        }

        trackEvent(`click_${event}`, {
            from: 'button'
        });
    }

    $: resolvedClasses = [
        'button',
        disabled && 'is-disabled',
        round && 'is-only-icon',
        secondary && 'is-secondary',
        text && 'is-text',
        danger && 'is-danger',
        fullWidth && 'is-full-width',
        noMargin && 'u-padding-inline-0',
        classes
    ]
        .filter(Boolean)
        .join(' ');
</script>

{#if href}
    <a
        on:click={track}
        {href}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}
        class={resolvedClasses}
        aria-label={ariaLabel}>
        <slot />
    </a>
{:else}
    <button
        on:click
        on:click={track}
        disabled={internalDisabled}
        class={resolvedClasses}
        aria-label={ariaLabel}
        type={submit === false ? 'button' : undefined}>
        <slot />
    </button>
{/if}
