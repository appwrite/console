<script lang="ts">
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { default as IconImagine } from '$routes/(console)/project-[region]-[project]/studio/assets/icon-imagine.svelte';
    import ImagineBg from '../images/login/imagine-bg.webp';
    import type { Snippet } from 'svelte';

    type Props = {
        title: string;
        children: Snippet;
    };

    let { title, children }: Props = $props();
</script>

<main class="full-page-signup">
    <div class="presentational not-mobile">
        <div class="icon-container">
            <IconImagine />
        </div>

        <img src={ImagineBg} class="background-image" alt="" />
    </div>
    <Layout.Stack class="recovery-form theme-light" gap="xxl">
        <Typography.Title size="xl" --font-color="#2D2D31">{title}</Typography.Title>
        <Card.Base
            padding="l"
            variant="secondary"
            --bgcolor-neutral-default="#fff"
            --border-neutral="#EDEDF0"
            shadow={false}>
            {@render children()}
        </Card.Base>
    </Layout.Stack>
</main>

<style lang="scss">
    .full-page-signup {
        width: 100vw;
        height: 100vh;
        position: fixed;
        z-index: 3;

        display: grid;
        justify-content: center;
        align-items: center;
        grid-template-columns: repeat(1, 1fr);

        @media (min-width: 768px) {
            grid-template-columns: repeat(2, 1fr);
        }

        .presentational {
            background-color: #000;
            height: 100vh;
            display: none;
            width: 100%;
            position: relative;
            align-items: center;
            justify-content: center;

            @media (min-width: 768px) {
                display: flex;
            }

            .background-image {
                position: absolute;
                inset: 0;
                z-index: 0;
                width: 100%;
                object-fit: cover;
            }

            .icon-container {
                position: relative;
                z-index: 1;
                color: var(--fgcolor-neutral-primary);
                margin-block-end: calc(-1 * var(--space-4));
            }

            :global(.icon-container svg) {
                width: 120px;
                height: 120px;
            }
        }

        :global(.recovery-form) {
            background-color: var(--fgcolor-neutral-default, #fafafb);
            display: flex;
            height: 100vh;
            padding: 0 128px;
            align-items: center;
            justify-content: center;
        }
    }
</style>
