<script lang="ts">
    export let isCommonSection = false;
    export let gap = 24;
</script>

<ul
    class="form-list"
    class:common-section={isCommonSection}
    style={`--form-list-gap: ${gap / 16}rem;`}>
    <slot />
</ul>
