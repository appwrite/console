<script>
    import { Shell } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import Footer from '$lib/layout/footer.svelte';
</script>

<Shell>
    <a class="logo" slot="header" href={`/console`}>
        <img
            src={$app.themeInUse == 'dark' ? AppwriteLogoDark : AppwriteLogoLight}
            width="120"
            height="22"
            alt="Appwrite Logo" />
    </a>
    <slot />
    <Footer slot="footer" />
</Shell>
