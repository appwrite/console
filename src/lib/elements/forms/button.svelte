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
    export let size: Props['size'] = 's';
    export let disabled = false;
    export let external = false;
    export let href: string = null;
    export let download: string = undefined;
    export let badge: string = null;
    export let fullWidth = false;
    export let fullWidthMobile = false;
    export let ariaLabel: string = null;
    export let event: string = null;
    export let eventData: Record<string, unknown> = {};
    let classes: string = '';
    export { classes as class };
    export let submissionLoader = false;
    export let forceShowLoader = false;

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
        {icon}
        disabled={internalDisabled}
        variant={secondary ? 'secondary' : text ? 'text' : 'primary'}
        target={external ? '_blank' : ''}
        rel={external ? 'noopener noreferrer' : ''}
        class={resolvedClasses}
        aria-label={ariaLabel}
        --button-width={fullWidth ? '100%' : 'max-content'}>
        <slot />
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
        variant={secondary ? 'secondary' : text ? 'text' : 'primary'}
        class={resolvedClasses}
        aria-label={ariaLabel}
        type={submit ? 'submit' : 'button'}
        --button-width={fullWidth ? '100%' : 'max-content'}>
        <slot name="start" slot="start" />
        {#if ($isSubmitting && submissionLoader) || (forceShowLoader && submissionLoader)}
            <span
                class="loader is-small"
                style:--p-loader-base-full-color="transparent"
                aria-hidden="true" />
        {/if}
        <slot isSubmitting={$isSubmitting} />
        <slot slot="end" name="end" />
    </Button.Button>
{/if}
