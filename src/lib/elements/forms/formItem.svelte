<script context="module" lang="ts">
    export type FormItemTag = 'li' | 'div';
</script>

<script lang="ts">
    export let tag: FormItemTag = 'li';
    export let fullWidth = false;
    export let isMultiple = false;
    export let stackOnMobile = false;
    export let style: string = '';
    let classes: string = '';
    export { classes as class };
</script>

<slot />
