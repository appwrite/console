<script lang="ts">
    export let fullWidth = false;
    export let alignEnd = false;
</script>

<div class="form-item-part" class:u-cross-child-end={alignEnd} class:u-stretch={fullWidth}>
    <slot />
</div>
