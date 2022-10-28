<script lang="ts">
    export let isCommonSection = false;
</script>

<ul class="form-list" class:common-section={isCommonSection}>
    <slot />
</ul>
