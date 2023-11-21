<script context="module" lang="ts">
    export type FormItemTag = 'li' | 'div';
</script>

<script lang="ts">
    export let tag: FormItemTag = 'li';
    export let fullWidth = false;
    export let isMultiple = false;
    export let style: string = '';
    let classes: string = '';
    export { classes as class };
</script>

<svelte:element
    this={tag}
    class="form-item {classes}"
    {style}
    class:is-multiple={isMultiple}
    class:u-width-full-line={fullWidth}>
    <slot />
</svelte:element>
