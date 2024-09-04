<script lang="ts">
    export let large = false;
    export let stretch = false;
    let classes: string = '';
    export { classes as class };
</script>

<ul class="secondary-tabs {classes}" class:is-large={large} class:is-stretch={stretch}>
    <slot />
</ul>
