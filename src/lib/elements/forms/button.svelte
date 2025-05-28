<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { getContext, hasContext } from 'svelte';
    import { readable } from 'svelte/store';
    import type { FormContext } from './form.svelte';
    import { Button } from '@appwrite.io/pink-svelte';
    import type { ComponentProps } from 'svelte';

    type Props = ComponentProps<Button.Button | Button.Anchor>;

    export let submit = false;
    export let secondary = false;
    export let text = false;
    export let icon = false;
    export let danger = false;
    export let size: Props['size'] = 's';
    export let disabled = false;
    export let external = false;
    export let href: string = null;
    export let download: string = undefined;
    export let badge: string = undefined;
    export let fullWidth = false;
    export let fullWidthMobile = false;
    export let ariaLabel: string = null;
    export let event: string = null;
    export let eventData: Record<string, unknown> = {};
    let classes: string = '';
    export { classes as class };
    export let submissionLoader = false;
    export let forceShowLoader = false;
    export let compact = false;
    export let extraCompact = false;

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

    function getVariant():
        | 'primary'
        | 'secondary'
        | 'text'
        | 'compact'
        | 'danger'
        | 'extra-compact' {
        switch (true) {
            case secondary:
                return 'secondary';
            case text:
                return 'text';
            case compact:
                return 'compact';
            case extraCompact:
                return 'extra-compact';
            case danger:
                return 'danger';
            default:
                return 'primary';
        }
    }

    $: variant = getVariant();
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
        {icon}
        disabled={internalDisabled}
        {variant}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}
        class={resolvedClasses}
        aria-label={ariaLabel}>
        <slot name="start" slot="start" />
        <slot />
        <slot slot="end" name="end" />
    </Button.Anchor>
{:else}
    <Button.Button
        on:click
        on:mousedown
        on:click={track}
        {size}
        {icon}
        {badge}
        disabled={internalDisabled}
        {variant}
        class={resolvedClasses}
        aria-label={ariaLabel}
        type={submit ? 'submit' : 'button'}>
        <slot name="start" slot="start" />
        {#if ($isSubmitting && submissionLoader) || (forceShowLoader && submissionLoader)}
            <span
                class="loader is-small"
                style:--p-loader-base-full-color="transparent"
                aria-hidden="true"></span>
        {/if}
        <slot isSubmitting={$isSubmitting} />
        <slot slot="end" name="end" />
    </Button.Button>
{/if}

<!-- built-in classes don't seem to work -->
<style lang="scss">
    :global {
        .is-full-width {
            width: 100% !important;
        }

        @media (max-width: 768px) {
            .is-full-width-mobile {
                width: 100% !important;
            }
        }
    }
</style>
