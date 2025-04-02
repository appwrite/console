<script>
    let { children } = $props();
</script>

<em>{@render children?.()}</em>

<style>
    em {
        font-style: italic;
    }
</style>
