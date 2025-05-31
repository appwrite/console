<script context="module" lang="ts">
    export type BaseCardProps = Partial<{
        variant: 'primary' | 'secondary';
        radius: 's' | 'm' | 'l';
        padding: 'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l';
        border: 'solid' | 'dashed';
        shadow?: boolean;
        disabled?: boolean;
    }>;
</script>

<script lang="ts">
    import { Card, Layout } from '@appwrite.io/pink-svelte';

    type BaseProps = {
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

    type $$Props = BaseProps & (ButtonProps | AnchorProps | BaseProps) & BaseCardProps;

    export let isDashed = false;
    export let isButton = false;
    export let href: string = null;
    let classes = '';
    export { classes as class };
    export let style = '';
    export let padding: $$Props['padding'] = 'm';
    export let radius: $$Props['radius'] = 'm';
    export let variant: $$Props['variant'] = 'primary';

    $: resolvedClasses = [classes].filter(Boolean).join(' ');
</script>

{#if href}
    <Card.Link class={resolvedClasses} {href} {style} {padding} {radius} {variant} on:click>
        <Layout.Stack gap="xl">
            <slot />
        </Layout.Stack>
    </Card.Link>
{:else if isButton}
    <Card.Button class={resolvedClasses} {style} {padding} {radius} {variant} on:click>
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
        {radius}
        {variant}>
        <Layout.Stack gap="xl">
            <slot />
        </Layout.Stack>
    </Card.Base>
{/if}
