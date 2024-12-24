<script>
    import { Spinner, Typography } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    export let startAnimation = false;

    const loadingSentences = ['Setting up 20 authentication methods...', 'Doing something else...'];
    let currentSentenceIndex = 0;
    let visible = true;

    onMount(() => {
        const interval = setInterval(() => {
            visible = false;
            currentSentenceIndex = (currentSentenceIndex + 1) % loadingSentences.length;
            setTimeout(() => {
                visible = true;
            }, 1000);
        }, 5000);

        return () => clearInterval(interval);
    });
</script>

<div class="grid-container" class:start-animation={startAnimation}>
    <div class="static-loader">
        <Spinner />
        <Typography.Title size="l">Creating your project</Typography.Title>

        <div style="height: 30px">
            {#if visible}
                <span id="subtitle" transition:fade>{loadingSentences[currentSentenceIndex]}</span>
            {/if}
        </div>
    </div>
    <div class="title-container">
        <Typography.Title size="l">Welcome to Appwrite</Typography.Title>
    </div>
    <div class="grid">
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 1; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 2; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 3; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 4; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 5; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 6; " />
        <div class="border-right is-only-desktop" style="grid-row: 1 / 6; grid-column-start: 7; " />
        <div class="border-right is-only-desktop" style="grid-row: 1 / 6; grid-column-start: 8; " />

        <div class="border-bottom" style="grid-row-start: 1;" />
        <div class="border-bottom" style="grid-row-start: 2;" />
        <div class="border-bottom" style="grid-row-start: 3;" />
        <div class="border-bottom" style="grid-row-start: 4;" />

        <div class="vertical-fade-top" style="grid-row-start: 1; " />
        <div class="vertical-fade-bottom" style="grid-row-start: 5; " />
        <div class="horizontal-fade-left" style="grid-row: 1 / 6; grid-column-start: 1;" />
        <div class="horizontal-fade-right" style="grid-row: 1 / 6; " />

        <div class="icon icon1">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon1.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon2">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon2.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon3">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon3.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon4">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon4.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon5">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon5.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon6">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon6.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon7">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon6.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon8">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon6.svg`} alt="" />
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
    .grid-container {
        max-width: 100vw;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: var(--color-fgcolor-neutral-primary, #2d2d31);

        --animation-type: ease-in-out;
        --icon-colorize-animation-duration: 0.3s; // duration of icons going from gray to colorized
        --icon-move-to-center-animation-duration: 0.8s; // duration of icons merging together
        --icons-fade-out-animation-duration: 0.25s; //duration of icons disappearing animation
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
        --welcome-to-appwrite-delay: calc(var(--icon-move-to-center-delay) + 0.3s);

        --cell-dimension: 65px;
        --icon-width: 26px;
        --border-radius-container: 17px;
        --border-radius-content: 12px;

        @media (min-width: 768px) {
            --cell-dimension: 120px;
            --icon-width: 48px;
            --border-radius-container: 32px;
            --border-radius-content: 22px;
        }

        --half-cell-dimension: calc(var(--cell-dimension) * 0.5);
        --double-cell-dimension: calc(var(--cell-dimension) * 2);
        --triple-cell-dimension: calc(var(--cell-dimension) * 3);
        --quadriple-cell-dimension: calc(var(--cell-dimension) * 4);
        --negative-cell-dimension: calc(var(--cell-dimension) * -1);
        --negative-double-cell-dimension: calc(var(--cell-dimension) * -2);
        --negative-triple-cell-dimension: calc(var(--cell-dimension) * -3);
        --negative-quadriple-cell-dimension: calc(var(--cell-dimension) * -4);
    }

    .static-loader {
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        margin-bottom: 50px;
        transition: opacity 0.5s var(--animation-type);
    }
    .start-animation .static-loader {
        opacity: 0;
    }
    .title-container {
        margin-bottom: -100px;
        z-index: 1;
        opacity: 0;
    }
    .start-animation .title-container {
        opacity: 1;
        transition: opacity var(--welcome-to-appwrite-animation-duration) var(--animation-type)
            var(--welcome-to-appwrite-delay);
    }
    .grid {
        opacity: 0;
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

    .start-animation .grid {
        opacity: 1;
    }

    .icon {
        transition: transform var(--icon-move-to-center-animation-duration) var(--animation-type)
            var(--icon-move-to-center-delay);
    }
    .appwrite {
        opacity: 0;
        grid-row-start: 3;
        grid-column-start: 4;
        @media (min-width: 768px) {
            grid-row-start: 3;
            grid-column-start: 5;
        }
    }

    .border-right {
        border-right: 1px solid #e4e4e7;
    }
    .border-bottom {
        border-bottom: 1px solid #e4e4e7;
        grid-column: 1/8;
        @media (min-width: 768px) {
            grid-column: 1/10;
        }
    }

    .vertical-fade-top {
        background: linear-gradient(to bottom, hsl(var(--p-body-bg-color)) 0%, transparent 100%);
        grid-column: 1/8;
        @media (min-width: 768px) {
            grid-column: 1/10;
        }
    }
    .vertical-fade-bottom {
        background: linear-gradient(to top, hsl(var(--p-body-bg-color)) 0%, transparent 100%);
        grid-column: 1/8;
        @media (min-width: 768px) {
            grid-column: 1/10;
        }
    }
    .horizontal-fade-left {
        background: linear-gradient(to right, hsl(var(--p-body-bg-color)) 0%, transparent 100%);
    }
    .horizontal-fade-right {
        background: linear-gradient(to left, hsl(var(--p-body-bg-color)) 0%, transparent 100%);
        grid-column-start: 7;
        @media (min-width: 768px) {
            grid-column-start: 9;
        }
    }

    .icon-container {
        width: calc(var(--cell-dimension) + 20px);
        aspect-ratio: 1/1;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: -10px;
        margin-left: -10px;
        border-radius: var(--border-radius-container);
        opacity: 0.2;
        transition:
            opacity var(--icon-colorize-animation-duration) var(--animation-type)
                var(--show-icon-color-delay),
            box-shadow var(--icon-colorize-animation-duration) var(--animation-type)
                var(--show-icon-color-delay);
    }

    .icon-content {
        width: var(--cell-dimension);
        aspect-ratio: 1/1;
        border-radius: var(--border-radius-content);
        border: 0.5px solid #ededf0;
        display: flex;
        justify-content: center;
        align-items: center;
        filter: grayscale(100%);

        img {
            width: var(--icon-width);
        }
    }

    @keyframes grayscale-animation {
        100% {
            -webkit-filter: grayscale(0%);
            filter: grayscale(0%);
        }
    }

    .start-animation .icon-container {
        opacity: 1;
        background: rgba(255, 255, 255, 0.5);
        border: 2.5px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 13px 13px 0 rgba(0, 0, 0, 0.04);
    }

    .start-animation .icon-content {
        box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.05);
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

    .start-animation .icon:not(.icon8) .icon-container {
        box-shadow: 0 13px 13px 0 rgba(0, 0, 0, 0);
    }
    .start-animation .icon:not(.icon8) .icon-content {
        opacity: 0;
        transition: opacity var(--icons-fade-out-animation-duration) var(--animation-type)
            var(--icons-fade-out-delay);
    }
    .start-animation .icon8 .icon-content {
        opacity: 0;
        transition: opacity var(--icons-fade-out-animation-duration) var(--animation-type)
            var(--final-icon-fade-out-delay);
    }
    .start-animation .appwrite {
        opacity: 1;
        transition: opacity var(--icons-fade-out-animation-duration) var(--animation-type)
            var(--appwrite-icon-fade-in-delay);
    }

    .start-animation .icon-content {
        animation: grayscale-animation var(--icon-colorize-animation-duration) var(--animation-type)
            var(--show-icon-color-delay);
        animation-fill-mode: forwards;
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

    .shimmer {
        text-align: center;
        color: rgba(255, 255, 255, 0.1);
        background: -webkit-gradient(
            linear,
            left top,
            right top,
            from(#222),
            to(#222),
            color-stop(0.5, #fff)
        );
        background: -moz-gradient(
            linear,
            left top,
            right top,
            from(#222),
            to(#222),
            color-stop(0.5, #fff)
        );
        background: gradient(
            linear,
            left top,
            right top,
            from(#222),
            to(#222),
            color-stop(0.5, #fff)
        );
        -webkit-background-size: 125px 100%;
        -moz-background-size: 125px 100%;
        background-size: 125px 100%;
        -webkit-background-clip: text;
        -moz-background-clip: text;
        background-clip: text;
        -webkit-animation-name: shimmer;
        -moz-animation-name: shimmer;
        animation-name: shimmer;
        -webkit-animation-duration: 2s;
        -moz-animation-duration: 2s;
        animation-duration: 2s;
        -webkit-animation-iteration-count: infinite;
        -moz-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
        background-repeat: no-repeat;
        background-position: 0 0;
        background-color: #222;
    }

    @-moz-keyframes shimmer {
        0% {
            background-position: top left;
        }
        100% {
            background-position: top right;
        }
    }

    @-webkit-keyframes shimmer {
        0% {
            background-position: top left;
        }
        100% {
            background-position: top right;
        }
    }

    @-o-keyframes shimmer {
        0% {
            background-position: top left;
        }
        100% {
            background-position: top right;
        }
    }

    @keyframes shimmer {
        0% {
            background-position: top left;
        }
        100% {
            background-position: top right;
        }
    }
</style>
