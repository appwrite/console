<script lang="ts">
    import { Card, Layout } from '@appwrite.io/pink-svelte';
    import type Base from '@appwrite.io/pink-svelte/dist/card/Base.svelte';
    import type { ComponentProps } from 'svelte';

    type BaseProps = {
        isTile?: boolean;
        isDashed?: boolean;
        danger?: boolean;
        style?: string;
        class?: string;
    };

    type ButtonProps = {
        isButton: true;
        href?: never;
    };

    type AnchorProps = {
        href: string;
        isButton?: never;
    };

    type $$Props = BaseProps & (ButtonProps | AnchorProps | BaseProps) & ComponentProps<Base>;

    export let isTile = false;
    export let isDashed = false;
    export let isButton = false;
    export let danger = false;
    export let href: string = null;
    let classes = '';
    export { classes as class };
    export let style = '';
    export let padding: $$Props['padding'] = 'm';
    export let radius: $$Props['radius'] = 'm';

    $: resolvedClasses = [!isTile && 'common-section', classes].filter(Boolean).join(' ');
</script>

{#if href}
    <Card.Link class={resolvedClasses} on:click {href} {style} {padding} {radius}>
        <Layout.Stack gap="xl">
            <slot />
        </Layout.Stack>
    </Card.Link>
{:else if isButton}
    <Card.Button class={resolvedClasses} {style} {padding} {radius} on:click>
        <Layout.Stack gap="xl">
            <slot />
        </Layout.Stack>
    </Card.Button>
{:else}
    <Card.Base
        class={resolvedClasses}
        {style}
        border={isDashed ? 'dashed' : 'solid'}
        {padding}
        {radius}>
        <Layout.Stack gap="xl">
            <slot />
        </Layout.Stack>
    </Card.Base>
{/if}
