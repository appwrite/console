<script>
    import { base } from '$app/paths';
    import { loading } from '$routes/store';
    import { app } from '$lib/stores/app';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    loading.set(false);
</script>

<Layout.Stack
    height="100vh"
    direction="column"
    alignItems="center"
    justifyContent="center"
    style="background: var(--bgcolor-neutral-primary, #fff);">
    <section class="console-container">
        <slot />
    </section>
    <footer>
        <Typography.Eyebrow color="--fgcolor-neutral-secondary">POWERED BY</Typography.Eyebrow>
        {#if $app.themeInUse === 'dark'}
            <img
                src="{base}/images/appwrite-logo-dark.svg"
                width="120"
                height="22"
                alt="Appwrite Logo" />
        {:else}
            <img
                src="{base}/images/appwrite-logo-light.svg"
                width="120"
                height="22"
                alt="Appwrite Logo" />
        {/if}
    </footer>
</Layout.Stack>

<style lang="scss">
    section {
        flex: 1;
        display: flex;
        align-items: center;
    }
    footer {
        padding: 2rem 1rem;
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
    }
</style>
