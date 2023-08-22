<script lang="ts">
    export let fullWidth = false;
    export let isMultiple = false;
</script>

<li class="form-item" class:is-multiple={isMultiple} class:u-width-full-line={fullWidth}>
    <slot />
</li>
