<script lang="ts">
    export let fullWidth = false;
</script>

<ul class="collapsible" class:u-width-full-line={fullWidth}>
    <slot />
</ul>
