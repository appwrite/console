<script lang="ts">
    import { Card, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import WizardCover from '$lib/layout/wizardCover.svelte';
    import { fade } from 'svelte/transition';
    import Hoodie from './hoodie.png';
    import { Confetti } from 'svelte-confetti';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { organization } from '$lib/stores/organization';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';

    $: postText = encodeURIComponent(
        [
            `Appwrite Pro is now available! `,
            ``,
            `Why did I upgrade?`,
            ``,
            `Because`,
            ``,
            `Discover Appwrite Pro and get started at https://appwrite.io/pricing`
        ].join('\n')
    );

    const confettiColors = [
        'hsl(var(--color-primary-100))',
        'hsl(var(--color-primary-200))',
        'hsl(var(--color-primary-300))',
        '#F05088',
        '#FF86BB',
        '#FFFFFF80',
        '#FE9567',
        '#85DBD8',
        '#E5E1FF'
    ];

    $: href = $organization?.$id
        ? `${base}/console/organization-${$organization.$id}`
        : `${base}/console`;
</script>

<WizardCover>
    <svelte:fragment slot="header">
        <div class="u-flex u-main-space-between">
            <a {href}>
                <img
                    src={$app.themeInUse == 'dark' ? AppwriteLogoDark : AppwriteLogoLight}
                    width="120"
                    height="22"
                    alt="Appwrite" />
            </a>
            <button
                on:click={wizard.hide}
                class="button is-text is-only-icon"
                style:--button-size="1.5rem"
                aria-label="close popup">
                <span class="icon-x" aria-hidden="true" />
            </button>
        </div>
    </svelte:fragment>
    <div class="wizard-container u-flex-vertical">
        <div class="u-flex u-cross-center u-main-center hoodie-container">
            <Card>
                <div class="appwrite-pro">
                    <span class="text">APPWRITE</span>
                    <span class="appwrite-pro-text">
                        <span class="appwrite-pro-text-letter">P</span><span
                            class="appwrite-pro-text-letter">R</span
                        ><span class="appwrite-pro-text-letter">O</span></span>
                </div>
                <Heading class="u-margin-block-start-24" tag="h6" size="6">
                    Your organization has been upgraded 🎉
                </Heading>
                <p class="text">
                    Gear up for your new Pro plan! Share online for a chance to win an exclusive
                    Appwrite Pro hoodie.
                </p>

                <div class="u-margin-block-start-16 u-flex u-gap-16">
                    <Button secondary href="https://x.com/intent/tweet?text={postText}" external>
                        <span class="text">Share on </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="16"
                            viewBox="0 0 18 16"
                            fill="none">
                            <path
                                d="M13.8885 0.316772H16.4953L10.8002 6.82583L17.5 15.6832H12.2541L8.14539 10.3113L3.44405 15.6832H0.835697L6.92711 8.72103L0.5 0.316772H5.87904L9.59299 5.22694L13.8885 0.316772ZM12.9736 14.1229H14.418L5.09417 1.7951H3.54413L12.9736 14.1229Z"
                                fill={$app?.themeInUse === 'dark' ? '#C3C3C6' : '#414146'} />
                        </svg>
                    </Button>
                </div>

                <div class="common-section card-separator u-flex u-main-end">
                    <Button on:click={wizard.hide}>Go to console</Button>
                </div>
            </Card>
            <img class="hoodie-image" src={Hoodie} alt="" srcset="" style="aspect-ratio: 1.56 / 1;" />
            <div class="cbc-confetti" transition:fade>
                <Confetti
                    x={[-1.75, 1.85]}
                    y={[-1.875, 1]}
                    amount={200}
                    size={10}
                    infinite
                    delay={[2000, 7000]}
                    colorArray={confettiColors}
                    fallDistance="200px" />
            </div>
        </div>
    </div>
</WizardCover>

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_common.scss';
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';
    @import '@appwrite.io/pink/src/abstract/functions/_pxToRem.scss';

    .wizard-container {
        height: 100%;
        justify-content: center;
        @media #{$break2} {
            justify-content: flex-start;
            margin-block-start: 2rem;
        }
        @media #{$break1} {
            justify-content: flex-start;
            margin-block-start: 2rem;
        }
    }
    .hoodie-container {
        height: 350px;
        gap: 4rem;
        z-index: 1;
        @media #{$break2} {
            flex-wrap: wrap;
            justify-content: start;
            align-items: start;
            gap: 2rem;
        }
        @media #{$break1} {
            flex-wrap: wrap;
            justify-content: start;
            align-items: start;
            gap: 2rem;
        }
    }
    .hoodie-image {
        height: 100%;
        object-fit: contain;
        @media #{$break2} {
            width: 100%;
            align-self: start;
            height: auto;
        }
        @media #{$break1} {
            align-self: start;
            height: auto;
        }
    }

    .appwrite-pro {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: baseline;
        color: hsl(var(--color-neutral-100));

        @media #{$break2open} {
            gap: pxToRem(16);
            font-size: pxToRem(20);
            letter-spacing: pxToRem(8);
            line-height: 120%;
        }

        @media #{$break1} {
            gap: pxToRem(8);
            font-size: pxToRem(16);
            letter-spacing: pxToRem(4);
            line-height: 120%;
        }

        &-text {
            padding: pxToRem(9) pxToRem(14);
            border: pxToRem(2) solid hsl(343 98% 60% / 0.2);
            border-radius: pxToRem(16);
            background: rgba(253, 54, 110, 0.1);
            box-shadow: 0 -12.173px 20.289px 0px rgba(253, 54, 110, 0.08) inset;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            &-letter {
                width: 1rem;
            }
            @media #{$break1} {
                padding: pxToRem(8) pxToRem(12);
                border-radius: pxToRem(8);
            }
        }
    }

    :global(.theme-dark) .appwrite-pro {
        color: hsl(var(--color-neutral-10));
    }

    .cbc-confetti {
        position: absolute;
        top: 40%;
        right: 25%;
        translate: -50% -50%;
        z-index: -1;
    }

    @keyframes shake {
        0% {
            translate: 0;
        }
        25% {
            translate: 0 -4px;
        }
        50% {
            translate: 0 0px;
        }
        75% {
            translate: 0 0px;
        }
        100% {
            translate: 0 0px;
        }
    }
</style>
