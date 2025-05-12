<script lang="ts">
    import DesktopLight from '../../routes/(public)/(guest)/login/assets/desktop-light.png';
    import { Card, Divider, Layout, Typography } from '@appwrite.io/pink-svelte';

    let { title }: { title: string } = $props();
</script>

<main class="full-page-signup">
    <div class="modal">
        <Card.Base padding="s">
            <Layout.Stack direction="column">
                <Layout.Stack direction="row" justifyContent="center">
                    <div class="icon-container">
                        <svelte:component this={IconImagine}></svelte:component>
                    </div>
                </Layout.Stack>
                <Typography.Title size="m">{title}</Typography.Title>
                <slot />
            </Layout.Stack>
        </Card.Base>
    </div>
</main>
<div class="overlay-image" style:background-image={`url('${DesktopLight}');`}></div>
<div class="overlay-color"></div>

<style lang="scss">
    .full-page-signup {
        width: 100vw;
        height: 100vh;
        position: fixed;
        z-index: 3;

        display: flex;
        justify-content: center;
        align-items: center;

        .modal {
            width: 600px;
        }

        .icon-container {
            color: var(--fgcolor-neutral-primary);
        }
        :global(.icon-container svg) {
            width: 36px;
            height: 36px;
        }
    }

    .overlay-image {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        filter: blur(4px);
        background-size: cover;
    }
    .overlay-color {
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background: rgba(25, 25, 28, 0.8);
    }
</style>
