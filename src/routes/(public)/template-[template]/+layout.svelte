<script lang="ts">
    import { app } from '$lib/stores/app';
    import { Typography } from '@appwrite.io/pink-svelte';

    let { children } = $props();
</script>

<div class="auth-bg">
    <section class="console-container">
        {@render children()}
    </section>
    <footer>
        <Typography.Eyebrow color="--fgcolor-neutral-secondary">POWERED BY</Typography.Eyebrow>
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
        background: var(--bgcolor-neutral-primary, #fff);
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
        section {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }
        footer {
            padding: 2rem 1rem;
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
        }
    }
</style>
