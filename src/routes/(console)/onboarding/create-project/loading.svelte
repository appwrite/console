<script>
    import { Spinner, Typography } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';

    export let startAnimation = false;
</script>

<div class="grid-container" class:start-animation={startAnimation}>
    <div class="grid">
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 1; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 2; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 3; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 4; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 5; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 6; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 7; " />
        <div class="border-right" style="grid-row: 1 / 6; grid-column-start: 8; " />

        <div class="border-bottom" style="grid-row-start: 1; grid-column: 1/10" />
        <div class="border-bottom" style="grid-row-start: 2; grid-column: 1/10" />
        <div class="border-bottom" style="grid-row-start: 3; grid-column: 1/10" />
        <div class="border-bottom" style="grid-row-start: 4; grid-column: 1/10" />

        <div class="vertical-fade-top" style="grid-row-start: 1; grid-column: 1/10" />
        <div class="vertical-fade-bottom" style="grid-row-start: 5; grid-column: 1/10" />
        <div class="horizontal-fade-left" style="grid-row: 1 / 6; grid-column-start: 1;" />
        <div class="horizontal-fade-right" style="grid-row: 1 / 6; grid-column-start: 9;" />

        <div class="icon icon1" style="grid-row-start: 2; grid-column-start: 2">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon1.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon2" style="grid-row-start: 2; grid-column-start: 4">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon2.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon3" style="grid-row-start: 2; grid-column-start: 6">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon3.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon4" style="grid-row-start: 2; grid-column-start: 8">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon4.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon5" style="grid-row-start: 4; grid-column-start: 4">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon5.svg`} alt="" />
                </div>
            </div>
        </div>
        <div class="icon icon6" style="grid-row-start: 4; grid-column-start: 6">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/icon6.svg`} alt="" />
                </div>
            </div>
        </div>

        <div class="appwrite" style="grid-row-start: 3; grid-column-start: 5">
            <div class="icon-container">
                <div class="icon-content">
                    <img src={`${base}/images/onboarding/appwrite.svg`} alt="" />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .grid-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(9, 120px);
        grid-template-rows: 180px repeat(4, 120px);
    }

    .icon {
        transition: transform 0.5s ease-in 1s;
    }
    .appwrite {
        opacity: 0;
    }

    .border-right {
        border-right: 1px solid #e4e4e7;
    }
    .border-bottom {
        border-bottom: 1px solid #e4e4e7;
    }

    .vertical-fade-top {
        background: linear-gradient(to bottom, hsl(var(--p-body-bg-color)) 0%, transparent 100%);
    }
    .vertical-fade-bottom {
        background: linear-gradient(to top, hsl(var(--p-body-bg-color)) 0%, transparent 100%);
    }
    .horizontal-fade-left {
        background: linear-gradient(to right, hsl(var(--p-body-bg-color)) 0%, transparent 100%);
    }
    .horizontal-fade-right {
        background: linear-gradient(to left, hsl(var(--p-body-bg-color)) 0%, transparent 100%);
    }

    .icon-container {
        width: 140px;
        height: 140px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: -10px;
        margin-left: -10px;
        border-radius: var(--padding-cards-desktop, 32px);
        border: 2.5px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.5);
        box-shadow: 0 13px 13px 0 rgba(0, 0, 0, 0.04);
        opacity: 0.2;
        transition: opacity 0.5s ease-in;
    }

    .icon-content {
        width: 120px;
        height: 120px;
        border-radius: 22px;
        border: 0.5px solid #ededf0;
        background: #fff;
        box-shadow: 0 10px 10px 0 rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: center;
        align-items: center;
        filter: grayscale(1);
        transition: filter 0.5s ease-in;
    }

    .start-animation .icon-container {
        opacity: 1;
    }

    .start-animation .icon1 {
        transform: translateY(120px) translateX(360px);
    }
    .start-animation .icon2 {
        transform: translateY(120px) translateX(120px);
    }
    .start-animation .icon3 {
        transform: translateY(120px) translateX(-120px);
    }
    .start-animation .icon4 {
        transform: translateY(120px) translateX(-360px);
    }
    .start-animation .icon5 {
        transform: translateY(-120px) translateX(120px);
    }
    .start-animation .icon6 {
        transform: translateY(-120px) translateX(-120px);
    }

    .start-animation .icon:not(.icon6) .icon-content {
        opacity: 0;
        transition: opacity 0.1s ease-in 1.5s;
    }
    .start-animation .icon6 .icon-content {
        opacity: 0;
        transition: opacity 0.5s ease-in 2s;
    }
    .start-animation .appwrite {
        opacity: 1;
        transition: opacity 0.5s ease-in 2s;
    }

    .start-animation .icon-content {
        filter: grayscale(0);
    }
</style>
