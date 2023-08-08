<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { getContext, hasContext } from 'svelte';
    import { readable } from 'svelte/store';
    import type { FormContext } from './form.svelte';

    export let submit = false;
    export let secondary = false;
    export let github = false;
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
</script>

{#if href}
    <a
        on:click={track}
        {href}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}
        class="button"
        class:is-disabled={disabled}
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-github={github}
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
        disabled={internalDisabled}
        class="button"
        class:is-only-icon={round}
        class:is-secondary={secondary}
        class:is-github={github}
        class:is-danger={danger}
        class:is-text={text}
        class:is-full-width={fullWidth}
        class:u-padding-inline-0={noMargin}
        type={submit ? 'submit' : 'button'}
        aria-label={ariaLabel}>
        <slot />
    </button>
{/if}

<style lang="scss">
    .is-github {
        background-color: #373b4d;

        &:hover {
            background-color: lighten($color: #373b4d, $amount: 2.5);
        }

        &:active {
            background-color: darken($color: #373b4d, $amount: 5);
        }
    }
</style>
