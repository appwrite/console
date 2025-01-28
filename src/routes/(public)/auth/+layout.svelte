<script>
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { loading } from '$routes/store';
    import { Typography } from '@appwrite.io/pink-svelte';

    loading.set(false);
</script>

<div class="auth-bg">
    <div>
        <Container>
            <slot />
        </Container>
    </div>
    <footer>
        <!-- TODO: change text style to eyebrow -->
        <Typography.Text size="s" color="--color-fgColor-neutral-secondary">
            POWERED BY
        </Typography.Text>
        {#if $app.themeInUse === 'dark'}
            <img
                src="/console/images/appwrite-logo-dark.svg"
                width="120"
                height="22"
                alt="Appwrite Logo" />
        {:else}
            <img
                src="/console/images/appwrite-logo-light.svg"
                width="120"
                height="22"
                alt="Appwrite Logo" />
        {/if}
    </footer>
</div>

<style lang="scss">
    .auth-bg {
        position: fixed;
        background: var(--color-bgcolor-neutral-primary, #fff);
        background-size: cover;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        justify-content: space-between;
        div {
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
        }
    }
</style>
