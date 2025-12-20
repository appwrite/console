<script lang="ts">
    import { Card, Layout, Typography, Icon, Alert } from '@appwrite.io/pink-svelte';
    import { IconDeviceMobile, IconDesktopComputer } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
</script>

{#if $isSmallViewport}
    <div class="mobile-studio-scrim">
        <div class="mobile-studio-modal">
            <Card.Base variant="secondary" padding="l" radius="l">
                <Layout.Stack gap="l" alignItems="center" justifyContent="center">
                    <Icon icon={IconDesktopComputer} size="l" color="--fgcolor-neutral-primary" />
                    <Layout.Stack gap="m" alignItems="center">
                        <Typography.Title size="l" align="center">
                            This experience needs a larger screen
                        </Typography.Title>
                        <Typography.Text align="center" color="--fgcolor-neutral-secondary">
                            We're working on making Imagine Studio fully responsive for mobile
                            devices. For the best experience, please use Imagine Studio on a desktop
                            or tablet with a larger screen.
                        </Typography.Text>
                    </Layout.Stack>
                    <div class="studio-alert-wrapper">
                        <Alert.Inline status="info" title="Quick tip">
                            <svelte:fragment slot="icon">
                                <Icon icon={IconDeviceMobile} size="m" />
                            </svelte:fragment>
                            You can use desktop mode in your mobile's browser to access Studio
                        </Alert.Inline>
                    </div>
                </Layout.Stack>
            </Card.Base>
        </div>
    </div>
{/if}

<style>
    .mobile-studio-scrim {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: hsl(240 5% 8% / 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: var(--space-6, 12px);
    }

    .mobile-studio-modal {
        width: 100%;
        max-width: 480px;
    }

    .studio-alert-wrapper {
        margin-block-start: var(--space-2, 4px);
        width: 100%;
    }

    /* Prevent background scroll when mobile message is shown */
    :global(html:has(.mobile-studio-scrim)) {
        height: 100%;
        overflow: hidden !important;
    }
</style>
