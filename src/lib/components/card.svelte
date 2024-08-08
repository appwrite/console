<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';

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

    type $$Props = BaseProps & (ButtonProps | AnchorProps | BaseProps);

    export let isTile = false;
    export let isDashed = false;
    export let isButton = false;
    export let danger = false;
    export let href: string = null;
    let classes = '';
    export { classes as class };
    export let style = '';

    function getElement() {
        switch (true) {
            case !!href:
                return 'a';
            case isButton:
                return 'button';
            default:
                return 'article';
        }
    }
</script>

<svelte:element
    this={getElement()}
    class="card {classes}"
    class:common-section={!isTile}
    class:is-border-dashed={isDashed}
    class:is-danger={danger}
    class:is-allowed-focus={href}
    {...$$restProps}
    {style}
    on:click
    on:keyup={clickOnEnter}
    role={href || isButton ? 'button' : 'presentation'}
    {href}>
    <slot />
</svelte:element>
