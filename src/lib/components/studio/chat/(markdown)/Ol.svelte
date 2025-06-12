<script>
    let { children } = $props();
</script>

<ol>{@render children?.()}</ol>

<style>
    ol {
        list-style: decimal;
        margin-inline-start: 1rem;
    }
</style>
