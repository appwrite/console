<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { getContext, hasContext } from 'svelte';
    import { readable } from 'svelte/store';
    import type { FormContext } from './form.svelte';
    import { multiAction, type MultiActionArray } from '$lib/actions/multi-actions';

    export let submit = false;
    export let secondary = false;
    export let github = false;
    export let text = false;
    export let danger = false;
    export let round = false;
    export let link = false;
    export let disabled = false;
    export let external = false;
    export let href: string = null;
    export let download: string = undefined;
    export let fullWidth = false;
    export let fullWidthMobile = false;
    export let ariaLabel: string = null;
    export let noMargin = false;
    export let event: string = null;
    let classes: string = '';
    export { classes as class };
    export let actions: MultiActionArray = [];
    export let submissionLoader = false;

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
        link ? 'link' : 'button',
        disabled && 'is-disabled',
        round && 'is-only-icon',
        secondary && 'is-secondary',
        github && 'is-github',
        text && 'is-text',
        danger && 'is-danger',
        fullWidth && 'is-full-width',
        fullWidthMobile && 'is-full-width-mobile',
        noMargin && 'u-padding-inline-0',
        classes
    ]
        .filter(Boolean)
        .join(' ');
</script>

{#if href}
    <a
        on:click
        on:click={track}
        {href}
        {download}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}
        class={resolvedClasses}
        style="pointer-events: {internalDisabled ? 'none' : 'auto'};"
        aria-label={ariaLabel}
        use:multiAction={actions}>
        <slot />
    </a>
{:else}
    <button
        on:click
        on:click={track}
        disabled={internalDisabled}
        class={resolvedClasses}
        aria-label={ariaLabel}
        type={submit ? 'submit' : 'button'}
        use:multiAction={actions}>
        {#if $isSubmitting && submissionLoader}
            <span
                class="loader is-small"
                style:--p-loader-base-full-color="transparent"
                aria-hidden="true" />
        {/if}
        <slot isSubmitting={$isSubmitting} />
    </button>
{/if}
