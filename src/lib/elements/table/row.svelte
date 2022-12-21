<script lang="ts">
    export let href: string | undefined = undefined;
</script>

<svelte:element this={href ? 'a' : 'div'} {href} class="table-row" role="row">
    <slot />
</svelte:element>
