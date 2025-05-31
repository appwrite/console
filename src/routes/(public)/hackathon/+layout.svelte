<script>
    import { Shell } from '$lib/layout';
    import Footer from '$lib/layout/footer.svelte';
</script>

<Shell>
    <slot />
    <Footer slot="footer" />
</Shell>
