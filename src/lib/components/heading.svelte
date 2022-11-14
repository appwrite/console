<script lang="ts">
    export let tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    export let size: '1' | '2' | '3' | '4' | '5' | '6' | '7';
    export let trimmed = true;
    export let id: string = null;
</script>

<svelte:element this={tag} class={`heading-level-${size}`} class:u-trim-1={trimmed} {id}>
    <slot />
</svelte:element>
