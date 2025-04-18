<script>
    import { Spinner, Typography, Layout } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    export let startAnimation = false;

    const loadingSentences = [
        'Database services are initializing',
        'In-memory caching is ready',
        'Backup services are ready',
        'All 37 OAuth providers are ready',
        'Global CDN is ready',
        'Advanced DDoS protection is ready',
        'Appwrite network is ready'
    ];
    let currentSentenceIndex = 0;
    let visible = true;
    let removeShadow = false;
    let removeShadowTimeout;

    function handleResize() {
        startAnimation = false;
        removeShadow = false;
        setTimeout(() => {
            startAnimation = true;
            handleRemoveShadow();
        }, 1500);
    }

    function handleRemoveShadow() {
        removeShadowTimeout = setTimeout(() => {
            removeShadow = true;
        }, 2000); // wait for transition animation to be started
    }

    $: if (startAnimation) {
        handleRemoveShadow();
    }

    onMount(() => {
        const interval = setInterval(() => {
            visible = false;
            currentSentenceIndex = (currentSentenceIndex + 1) % loadingSentences.length;
            setTimeout(() => {
                visible = true;
            }, 1000);
        }, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(removeShadowTimeout);
        };
    });

    let initialDelay = 0;
</script>

<svelte:window on:resize={handleResize} />
<div class="grid-container" class:start-animation={startAnimation}>
    <div class="static-loader">
        <Layout.Stack alignItems="center" gap="l">
            <Spinner />
            <Typography.Title size="l">Creating your project</Typography.Title>

            <div style="height: 30px">
                {#if visible}
                    <span id="subtitle" transition:fade
                        >{loadingSentences[currentSentenceIndex]}</span>
                {/if}
            </div>
        </Layout.Stack>
    </div>
    <div class="title-container">
        <Typography.Title size="l">Welcome to Appwrite</Typography.Title>
    </div>
    <div class="grid" class:remove-shadow={removeShadow}>
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 1; "></div>
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 2; "></div>
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 3; "></div>
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 4; "></div>
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 5; "></div>
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 6; "></div>
        <div class="border-right is-not-mobile" style="grid-row: 1 / 6; grid-column-start: 7; ">
        </div>
        <div class="border-right is-not-mobile" style="grid-row: 1 / 6; grid-column-start: 8; ">
        </div>

        <div class="border-bottom" style="grid-row-start: 1;"></div>
        <div class="border-bottom" style="grid-row-start: 2;"></div>
        <div class="border-bottom" style="grid-row-start: 3;"></div>
        <div class="border-bottom" style="grid-row-start: 4;"></div>

        <div class="vertical-fade-top" style="grid-row-start: 1; "></div>
        <div class="vertical-fade-bottom" style="grid-row-start: 5; "></div>
        <div class="horizontal-fade-left" style="grid-row: 1 / 6; grid-column-start: 1;"></div>
        <div class="horizontal-fade-right" style="grid-row: 1 / 6; "></div>

        <div class="icon icon1" style:--delay={`${initialDelay}s`}>
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon1.svg`} class="u-only-light" alt="" />
                    <img
                        src={`${base}/images/onboarding/icon1-dark.svg`}
                        class="u-only-dark"
                        alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon2" style:--delay={`${initialDelay + 0.1}s`}>
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon2.svg`} class="u-only-light" alt="" />
                    <img
                        src={`${base}/images/onboarding/icon2-dark.svg`}
                        class="u-only-dark"
                        alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon3" style:--delay={`${initialDelay + 0.15}s`}>
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon3.svg`} class="u-only-light" alt="" />
                    <img
                        src={`${base}/images/onboarding/icon3-dark.svg`}
                        class="u-only-dark"
                        alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon4" style:--delay={`${initialDelay + 0.2}s`}>
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon4.svg`} class="u-only-light" alt="" />
                    <img
                        src={`${base}/images/onboarding/icon4-dark.svg`}
                        class="u-only-dark"
                        alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon5" style:--delay={`${initialDelay + 0.25}s`}>
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon5.svg`} class="u-only-light" alt="" />
                    <img
                        src={`${base}/images/onboarding/icon5-dark.svg`}
                        class="u-only-dark"
                        alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon6" style:--delay={`${initialDelay + 0.3}s`}>
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon6.svg`} class="u-only-light" alt="" />
                    <img
                        src={`${base}/images/onboarding/icon6-dark.svg`}
                        class="u-only-dark"
                        alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon7" style:--delay={`${initialDelay + 0.35}s`}>
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon6.svg`} class="u-only-light" alt="" />
                    <img
                        src={`${base}/images/onboarding/icon6-dark.svg`}
                        class="u-only-dark"
                        alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon8" style:--delay={`${initialDelay + 0.4}s`}>
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon6.svg`} class="u-only-light" alt="" />
                    <img
                        src={`${base}/images/onboarding/icon6-dark.svg`}
                        class="u-only-dark"
                        alt="" />
                </div>
            </div>
        </div>

        <div class="appwrite">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/appwrite.svg`} alt="" />
                </div>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    :global(.theme-dark) {
        --icon-content-background-color: var(--bgcolor-neutral-primary, #1d1d21);
        --icon-content-border-color: var(--overlay-skeleton);
        --icon-container-background-color: #242427;
        --icon-container-border-color: rgba(255, 255, 255, 0.02);
        --box-shadow: none;
    }
    :global(.theme-light) {
        --icon-content-background-color: var(--neutral-0, #ffffff);
        --icon-content-border-color: var(--neutral-50, #ededf0);
        --icon-container-background-color: rgba(255, 255, 255, 0.5);
        --icon-container-border-color: rgba(0, 0, 0, 0.02);
        --box-shadow: 0 12.973px 12.973px 0 rgba(0, 0, 0, 0.04);
    }
    .grid-container {
        max-width: 100vw;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: var(--fgcolor-neutral-primary, #2d2d31);

        --animation-type: cubic-bezier(0.77, 0, 0.175, 1);
        --icon-colorize-animation-duration: 0.3s; // duration of icons going from gray to colorized
        --icon-move-to-center-animation-duration: 0.8s; // duration of icons merging together
        --icons-fade-out-animation-duration: 0.75s; //duration of icons disappearing animation
        --welcome-to-appwrite-animation-duration: 0.8s; //duration of fading in the welcome to appwrite text
        --fade-in-animation-component-duration: 1s; //duration for the entire icon grid to show up

        --show-icon-color-delay: calc(var(--fade-in-animation-component-duration) + 0.5s);
        --icon-move-to-center-delay: calc(
            var(--show-icon-color-delay) + 0.5s
        ); //delay before the icons merging together is started
        --icons-fade-out-delay: calc(
            var(--icon-move-to-center-delay) + 0.4s
        ); // delay before icons start disappearing
        --final-icon-fade-out-delay: calc(
            var(--icons-fade-out-delay) + 0.4s
        ); //delay before the last icon start disappearing before the appwrite logo shows up
        --appwrite-icon-fade-in-delay: calc(
            var(--final-icon-fade-out-delay) + 0.1s
        ); //delay before the appwrite logo appears
        --welcome-to-appwrite-delay: calc(var(--icon-move-to-center-delay) + 1.25s);

        --cell-dimension: 65px;
        --icon-width: 26px;
        --border-radius-container: 17px;
        --border-radius-content: 12px;

        --half-cell-dimension: calc(var(--cell-dimension) * 0.5);
        --double-cell-dimension: calc(var(--cell-dimension) * 2);
        --triple-cell-dimension: calc(var(--cell-dimension) * 3);
        --quadriple-cell-dimension: calc(var(--cell-dimension) * 4);
        --negative-cell-dimension: calc(var(--cell-dimension) * -1);
        --negative-double-cell-dimension: calc(var(--cell-dimension) * -2);
        --negative-triple-cell-dimension: calc(var(--cell-dimension) * -3);
        --negative-quadriple-cell-dimension: calc(var(--cell-dimension) * -4);

        @media (min-width: 768px) {
            --cell-dimension: 120px;
            --icon-width: 48px;
            --border-radius-container: 32px;
            --border-radius-content: 22px;
        }
    }

    .static-loader {
        z-index: 1;
        transition: opacity 0.5s var(--animation-type);

        @media (min-width: 768px) {
            margin-top: 50px;
            margin-bottom: 50px;
        }
    }
    .start-animation .static-loader {
        opacity: 0;
    }
    .title-container {
        margin-bottom: -100px;
        z-index: 1;
        opacity: 0;
        filter: blur(4px);
        transform: translateY(-12px);
    }
    .start-animation .title-container {
        opacity: 1;
        filter: blur(0px);
        transform: translateY(0);
        transition-property: opacity, filter, transform;
        transition: var(--welcome-to-appwrite-animation-duration) var(--animation-type)
            var(--welcome-to-appwrite-delay);
    }
    .grid {
        transition: opacity var(--fade-in-animation-component-duration) var(--animation-type);
        display: grid;
        grid-template-columns: var(--half-cell-dimension) repeat(5, var(--cell-dimension)) var(
                --half-cell-dimension
            );
        grid-template-rows: 180px repeat(4, var(--cell-dimension));

        @media (min-width: 768px) {
            grid-template-columns: repeat(9, var(--cell-dimension));
            grid-template-rows: 180px repeat(4, var(--cell-dimension));
        }
    }

    .icon-container {
        width: calc(var(--cell-dimension) + 10px);
        padding: 5px;
        aspect-ratio: 1/1;
        margin-top: -5px;
        margin-left: -5px;
        box-sizing: border-box;

        border-radius: var(--border-radius-container);
        border-width: 1px;
        border-color: transparent;
        border-style: solid;
        transition: all calc(var(--icon-colorize-animation-duration) + var(--delay))
            var(--animation-type) var(--show-icon-color-delay);

        @media (min-width: 768px) {
            width: calc(var(--cell-dimension) + 20px);
            margin-top: -10px;
            margin-left: -10px;
            padding: 10px;
        }
    }

    .start-animation .icon-container {
        background-color: var(--icon-container-background-color);
        border-color: var(--icon-container-border-color);
        box-shadow: var(--box-shadow);
    }

    .icon-content {
        width: var(--cell-dimension);
        aspect-ratio: 1/1;
        border-radius: var(--border-radius-content);

        border-width: 1px;
        border-color: transparent;
        border-style: solid;
        display: flex;
        justify-content: center;
        align-items: center;
        filter: grayscale(100%) brightness(150%) contrast(90%);
        transition: all var(--icon-colorize-animation-duration) var(--animation-type)
            calc(var(--show-icon-color-delay) + var(--delay));

        img {
            width: var(--icon-width);
        }
    }

    .start-animation .icon-content {
        background: var(--icon-content-background-color);
        border-color: var(--icon-content-border-color);
    }

    .start-animation .icon-content {
        animation: grayscale-animation var(--icon-colorize-animation-duration) var(--animation-type)
            var(--show-icon-color-delay);
        animation-fill-mode: forwards;
    }

    @keyframes grayscale-animation {
        100% {
            -webkit-filter: grayscale(0%) brightness(100%) contrast(100%);
            filter: grayscale(0%) brightness(100%) contrast(100%);
        }
    }

    .icon {
        transition: transform var(--icon-move-to-center-animation-duration) var(--animation-type)
            calc(var(--icon-move-to-center-delay) + var(--delay));
    }
    .appwrite {
        opacity: 0;
        filter: blur(4px);
        grid-row-start: 3;
        grid-column-start: 4;
        @media (min-width: 768px) {
            grid-row-start: 3;
            grid-column-start: 5;
        }
    }

    .start-animation .appwrite {
        opacity: 1;
        filter: blur(0px);
        transition-property: opacity, filter;
        transition: var(--icons-fade-out-animation-duration) var(--animation-type)
            calc(var(--appwrite-icon-fade-in-delay) + 0.35s);
    }

    .border-right {
        border-right: 1px solid var(--border-neutral);
    }
    .border-bottom {
        border-bottom: 1px solid var(--border-neutral);
        grid-column: 1/8;
        @media (min-width: 768px) {
            grid-column: 1/10;
        }
    }

    .vertical-fade-top {
        background: linear-gradient(
            to bottom,
            var(--bgcolor-neutral-default, #19191c) 0%,
            transparent 100%
        );
        grid-column: 1/8;
        @media (min-width: 768px) {
            grid-column: 1/10;
        }
    }
    .vertical-fade-bottom {
        background: linear-gradient(
            to top,
            var(--bgcolor-neutral-default, #19191c) 0%,
            transparent 100%
        );
        grid-column: 1/8;
        @media (min-width: 768px) {
            grid-column: 1/10;
        }
    }
    .horizontal-fade-left {
        background: linear-gradient(
            to right,
            var(--bgcolor-neutral-default, #19191c) 0%,
            transparent 100%
        );
    }
    .horizontal-fade-right {
        background: linear-gradient(
            to left,
            var(--bgcolor-neutral-default, #19191c) 0%,
            transparent 100%
        );
        grid-column-start: 7;
        @media (min-width: 768px) {
            grid-column-start: 9;
        }
    }

    .start-animation .icon1 {
        transform: translateY(var(--cell-dimension)) translateX(var(--double-cell-dimension));
    }
    .start-animation .icon2 {
        transform: translateY(var(--cell-dimension)) translateX(0);
    }
    .start-animation .icon3 {
        transform: translateY(var(--cell-dimension))
            translateX(var(--negative-double-cell-dimension));
    }
    .start-animation .icon4 {
        transform: translateY(var(--negative-cell-dimension))
            translateX(var(--double-cell-dimension));
    }
    .start-animation .icon5 {
        transform: translateY(var(--negative-cell-dimension)) translateX(0);
    }
    .start-animation .icon6 {
        transform: translateY(var(--negative-cell-dimension))
            translateX(var(--double-cell-dimension));
    }

    .start-animation .icon7 {
        transform: translateY(var(--negative-cell-dimension)) translateX(0);
    }
    .start-animation .icon8 {
        transform: translateY(var(--negative-cell-dimension))
            translateX(var(--negative-double-cell-dimension));
    }

    .remove-shadow :not(.icon8) .icon-container {
        transition: box-shadow var(--icon-move-to-center-animation-duration) var(--animation-type);
        box-shadow: 0 12.973px 12.973px 0 rgba(0, 0, 0, 0);
    }

    .icon1 {
        grid-row-start: 2;
        grid-column-start: 2;

        @media (min-width: 768px) {
            grid-row-start: 2;
            grid-column-start: 3;
        }
    }

    .icon2 {
        grid-row-start: 2;
        grid-column-start: 4;
        @media (min-width: 768px) {
            grid-row-start: 2;
            grid-column-start: 5;
        }
    }

    .icon3 {
        grid-row-start: 2;
        grid-column-start: 6;
        @media (min-width: 768px) {
            grid-row-start: 2;
            grid-column-start: 7;
        }
    }

    .icon4 {
        grid-row-start: 4;
        grid-column-start: 2;
        @media (min-width: 768px) {
            grid-row-start: 4;
            grid-column-start: 3;
        }
    }
    .icon5 {
        grid-row-start: 4;
        grid-column-start: 4;
        @media (min-width: 768px) {
            grid-row-start: 4;
            grid-column-start: 5;
        }
    }

    .icon6 {
        display: none;
    }

    .icon7 {
        display: none;
    }

    .icon8 {
        grid-row-start: 4;
        grid-column-start: 6;
        @media (min-width: 768px) {
            grid-row-start: 4;
            grid-column-start: 7;
        }
    }
</style>
