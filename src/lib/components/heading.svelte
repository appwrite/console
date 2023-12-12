<script lang="ts">
    type NumSize = 1 | 2 | 3 | 4 | 5 | 6 | 7;
    type Size = NumSize | `${NumSize}`;

    export let tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    export let size: Size;
    export let trimmed = true;
    export let id: string = null;
    let classes = '';
    export { classes as class };
</script>

<svelte:element this={tag} class={`heading-level-${size} ${classes}`} class:u-trim-1={trimmed} {id}>
    <slot />
</svelte:element>
