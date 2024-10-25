<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { Card } from '@appwrite.io/pink-svelte';
    import { type ComponentProps } from 'svelte';
    import type Selector from '@appwrite.io/pink-svelte/dist/card/Selector.svelte';

    type Props = ComponentProps<Selector>;

    export let name: string;
    export let group: string;
    export let value: string | number | boolean;
    export let disabled = false;
    export let icon: string = null;
    export let imageIcon: string = null;
    export let fullHeight = true;
    export let borderRadius: 'xsmall' | 'small' | 'medium' | 'large' = 'small';
    export let backgroundColor: string = null;
    export let backgroundColorHover: string = null;
    export let tooltipText: string = null;
    export let tooltipShow = false;
    export let src: string = null;
    export let alt: string = null;

    // Pink v2
    export let radius: Props['radius'] = 'medium';
    export let padding: Props['padding'] = 'small';
    //temporarily unefined
    export let title: Props['title'] = undefined;

    // TODO: remove after label card migration
    let slotTitle: HTMLSpanElement;
</script>

<div use:tooltip={{ content: tooltipText, disabled: !tooltipText || !tooltipShow }}>
    <Card.Selector
        {padding}
        {src}
        {alt}
        {value}
        {disabled}
        title={title ?? slotTitle?.innerText}
        bind:group>
        <p>
            <slot />
        </p>
    </Card.Selector>
</div>
<span style="display: none" bind:this={slotTitle}>
    <slot name="title" />
</span>
<!-- <label
    class="card u-cursor-pointer"
    class:is-allow-focus={!disabled}
    class:is-disabled={disabled}
    class:u-height-100-percent={fullHeight}
    style:--card-border-radius={`var(${Radius[borderRadius]})`}
    style:--p-card-bg-color-default={backgroundColor}
    style:--p-card-bg-color-hover={backgroundColorHover}
    use:tooltip={{ content: tooltipText, disabled: !tooltipText || !tooltipShow }}>
    <div class="u-flex u-gap-8">
        <input
            class="is-small u-margin-block-start-2"
            type="radio"
            {name}
            {disabled}
            {value}
            bind:group
            on:click />
        {#if $$slots.custom}
            <slot name="custom" {disabled} />
        {:else}
            <div class="u-flex u-flex-vertical u-gap-4" class:u-opacity-50={disabled}>
                {#if $$slots.title}
                    <h4 class="body-text-2 u-bold"><slot name="title" /></h4>
                {/if}
                {#if $$slots.default}
                    <p class="u-color-text-gray u-small">
                        <slot />
                    </p>
                {/if}
            </div>
            {#if icon}
                <span class={`icon-${icon} u-margin-inline-start-auto`} aria-hidden="true" />
            {/if}
            {#if imageIcon}
                <img
                    class="u-margin-inline-start-auto"
                    style:max-inline-size="1.25rem"
                    style:max-block-size="1.25rem"
                    src={`${base}/icons/${$app.themeInUse}/color/${imageIcon}.svg`}
                    alt={imageIcon} />
            {/if}
        {/if}
    </div>
</label> -->
