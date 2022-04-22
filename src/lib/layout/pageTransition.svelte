<script>
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';
</script>

{#key $page.url.pathname}
    <section in:fade>
        <slot />
    </section>
{/key}
