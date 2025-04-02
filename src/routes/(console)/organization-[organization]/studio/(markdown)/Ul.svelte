<script>
    let { children } = $props();
</script>

<ul>{@render children?.()}</ul>

<style>
    ul {
        list-style: square;
        margin-inline-start: 1rem;
    }
</style>
