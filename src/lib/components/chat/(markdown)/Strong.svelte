<script>
    let { children } = $props();
</script>

<strong>{@render children?.()}</strong>

<style>
    strong {
        font-weight: 600;
    }
</style>
