<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { getContext, hasContext } from 'svelte';
    import { readable } from 'svelte/store';
    import type { FormContext } from './form.svelte';
    import { Button } from '@appwrite.io/pink-svelte';
    import type { ComponentProps } from 'svelte';

    type Props = ComponentProps<Button.Button>;

    export let submit = false;
    export let secondary = false;
    export let text = false;
    export let danger = false;
    export let round = false;
    export let link = false;
    export let size: Props['size'] = 'medium';
    export let disabled = false;
    export let external = false;
    export let href: string = null;
    export let download: string = undefined;
    export let fullWidth = false;
    export let fullWidthMobile = false;
    export let ariaLabel: string = null;
    export let event: string = null;
    export let eventData: Record<string, unknown> = {};
    let classes: string = '';
    export { classes as class };
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
            from: 'button',
            ...eventData
        });
    }

    $: resolvedClasses = [
        fullWidth && 'is-full-width',
        fullWidthMobile && 'is-full-width-mobile',
        classes
    ]
        .filter(Boolean)
        .join(' ');
</script>

{#if href}
    <Button.Anchor
        on:click
        on:mousedown
        on:click={track}
        {href}
        {download}
        {size}
        disabled={internalDisabled}
        variant={secondary ? 'secondary' : text ? 'text' : 'primary'}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}
        class={resolvedClasses}
        aria-label={ariaLabel}
        --button-width={fullWidth ? '100%' : undefined}>
        <slot />
    </Button.Anchor>
{:else}
    <Button.Button
        on:click
        on:mousedown
        on:click={track}
        {size}
        disabled={internalDisabled}
        variant={secondary ? 'secondary' : text ? 'text' : 'primary'}
        class={resolvedClasses}
        aria-label={ariaLabel}
        type={submit ? 'submit' : 'button'}
        --button-width={fullWidth ? '100%' : undefined}>
        {#if $isSubmitting && submissionLoader}
            <span
                class="loader is-small"
                style:--p-loader-base-full-color="transparent"
                aria-hidden="true" />
        {/if}
        <slot isSubmitting={$isSubmitting} />
    </Button.Button>
{/if}
