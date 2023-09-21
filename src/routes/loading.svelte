<script>
    import { fade } from 'svelte/transition';
    import { app } from '$lib/stores/app';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
</script>

<div class="load-screen" out:fade>
    <div class="animation">
        <div />
        <div />
        <div />
        <div />
    </div>
    <img
        src={$app.themeInUse == 'dark' ? AppwriteLogoDark : AppwriteLogoLight}
        width="120"
        height="22"
        alt="Appwrite Logo" />
</div>

<style lang="scss">
    .load-screen {
        z-index: 100000;
        position: fixed;
        height: 100%;
        width: 100%;
        background-color: hsl(var(--p-body-bg-color));
        top: 0;

        .animation {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) translateZ(1px);
            width: 140px;
            height: 140px;

            div {
                box-sizing: border-box;
                display: block;
                position: absolute;
                width: 124px;
                height: 124px;
                margin: 10px;
                border: 10px solid hsl(var(--color-primary-200));
                border-radius: 50%;
                animation: animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                border-color: hsl(var(--color-primary-200)) transparent transparent transparent;

                &:nth-child(1) {
                    animation-delay: -0.45s;
                }
                &:nth-child(2) {
                    animation-delay: -0.3s;
                }
                &:nth-child(3) {
                    animation-delay: -0.15s;
                }
            }
        }

        @keyframes animation {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        img {
            position: absolute;
            max-width: 100%;
            bottom: 60px;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
</style>
