<script lang="ts">
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { loading } from '$routes/store';
    import { Typography } from '@appwrite.io/pink-svelte';

    loading.set(false);
</script>

<div class="auth-bg">
    <section>
        <div class="oauth2-shell">
            <slot />
        </div>
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
</div>

<style lang="scss">
    .auth-bg {
        position: fixed;
        inset: 0;
        overflow-y: auto;
        background: var(--bgcolor-neutral-primary, #fff);
        background-size: cover;
        display: flex;
        flex-direction: column;
        section {
            /* Grow to fill (keeping the card centered) when the card is short, but
               never shrink below the card's own height — so a tall card overflows
               the shell and scrolls instead of being clipped above the fold. */
            flex: 1 0 auto;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-block: 2rem;
            padding-inline: 1rem;
        }
        .oauth2-shell {
            width: 100%;
            max-width: 28rem;
        }
        footer {
            flex-shrink: 0;
            padding: 2rem 1rem;
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
        }
    }
</style>
