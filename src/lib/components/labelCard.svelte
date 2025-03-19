<script lang="ts">
    import { Card, Tooltip } from '@appwrite.io/pink-svelte';
    import { type ComponentProps } from 'svelte';
    import type Selector from '@appwrite.io/pink-svelte/dist/card/Selector.svelte';

    type Props = ComponentProps<Selector>;

    export let group: string;
    export let value: string;
    export let tooltipText: string = null;
    export let tooltipShow = false;

    // Pink v2
    export let icon: Props['icon'] = undefined;
    export let radius: Props['radius'] = 's';
    export let imageRadius: Props['imageRadius'] = 'xxs';
    export let padding: Props['padding'] = 's';
    export let variant: Props['variant'] = 'primary';
    export let name: Props['name'] = undefined;
    //temporarily undefined
    export let title: Props['title'] = undefined;
    export let disabled = false;
    export let src: string = null;
    export let alt: string = null;

    // TODO: remove after label card migration
    let slotTitle: HTMLSpanElement;
</script>

<Tooltip disabled={!tooltipText || !tooltipShow}>
    <Card.Selector
        {name}
        {src}
        {alt}
        {icon}
        {padding}
        {imageRadius}
        {variant}
        {value}
        {radius}
        {disabled}
        title={title ?? slotTitle?.innerText}
        bind:group>
        {#if $$slots.default}
            <slot />
        {/if}
        <slot name="action" slot="action" />
    </Card.Selector>
    <span slot="tooltip">{tooltipText}</span>
</Tooltip>

<span style="display: none" bind:this={slotTitle}>
    <slot name="title" />
</span>
