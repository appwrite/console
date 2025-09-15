<script>
    import { page } from '$app/state';

    let { children } = $props();
</script>

{#if page.data.header}
    {@const Header = page.data.header}
    <Header path={page.data.path} back={page.data.back} />
{/if}

{@render children()}
