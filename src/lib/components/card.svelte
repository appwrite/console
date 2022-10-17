<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let isTile = false;
    export let href: string = null;
</script>

<svelte:element
    this={href ? 'a' : 'article'}
    class="card"
    class:common-section={!isTile}
    on:click
    on:keyup={clickOnEnter}
    {href}>
    <slot />
</svelte:element>
