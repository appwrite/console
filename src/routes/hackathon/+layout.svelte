<script>
    import { Shell } from '$lib/layout';
    import AppwriteLogo from '$lib/images/appwrite-gray-light.svg';
    import Footer from '$lib/layout/footer.svelte';
</script>

<Shell>
    <a class="logo" slot="header" href={`/console`}>
        <img src={AppwriteLogo} width="132" height="34" alt="Appwrite" />
    </a>
    <slot />
    <Footer slot="footer" />
</Shell>
