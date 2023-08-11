<script lang="ts">
    export let isCommonSection = false;
    export let gap = 24;
    let classes = '';
    export { classes as class };
</script>

<ul
    class="form-list {classes}"
    class:common-section={isCommonSection}
    style={`--form-list-gap: ${gap / 16}rem;`}>
    <slot />
</ul>
