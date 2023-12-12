<script lang="ts">
    export let large = false;
    let classes: string = undefined;
    export { classes as class };
</script>

<ul class="secondary-tabs {classes}" class:is-large={large}>
    <slot />
</ul>
