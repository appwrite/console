<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Card, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import WizardCover from '$lib/layout/wizardCover.svelte';
    import { fade } from 'svelte/transition';
    import Hoodie from './hoodie.png';
    import { Confetti } from 'svelte-confetti';

    $: twitterText = encodeURIComponent(
        [
            `Appwrite Pro is now available! `,
            ``,
            `Why did I upgrade?`,
            ``,
            `Because`,
            ``,
            `Discover Appwrite Pro and get started at https://appwrite.io/pro`
        ].join('\n')
    );

    const confettiColors = [
        'hsl(var(--color-primary-100))',
        'hsl(var(--color-primary-200))',
        'hsl(var(--color-primary-300))',
        '#F05088',
        '#FF86BB',
        '#FFFFFF80'
    ];
</script>

<WizardCover>
    <svelte:fragment slot="title">Win an Appwrite Pro hoodie</svelte:fragment>
    <div class="wizard-container container">
        <div class="u-grid-1-1 u-gap-24">
            <Card class="u-grid-1-1-col-1">
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

                <p class="eyebrow-heading-3 u-margin-block-start-24">
                    {'Share on social media'.toUpperCase()}
                </p>
                <div class="u-margin-block-start-16 u-flex u-gap-16">
                    <Button
                        secondary
                        round
                        href="https://twitter.com/intent/tweet?text={twitterText}"
                        external>
                        <span class="icon-twitter" aria-label="Share on X" />
                    </Button>
                    <Button
                        secondary
                        round
                        href="https://twitter.com/intent/tweet?text={twitterText}">
                        <span class="icon-linkedin" aria-label="Share on linkedin" />
                    </Button>
                </div>

                <div class="common-section card-separator u-flex u-main-end">
                    <Button
                        on:click={() => {
                            trackEvent('click_create_function_manual', {
                                from: 'cover'
                            });
                        }}
                        on:click>
                        Go to console
                    </Button>
                </div>
            </Card>
            <div class="u-grid-1-1-col-2">
                <img class="hoodie-image" src={Hoodie} alt="" srcset="" />
            </div>
            <div class="cbc-confetti" transition:fade>
                <Confetti
                    x={[-1.75, 1.85]}
                    y={[-1.875, 1]}
                    amount={100}
                    size={10}
                    infinite
                    delay={[2000, 7000]}
                    colorArray={confettiColors}
                    fallDistance="400px" />
            </div>
        </div>
    </div>
</WizardCover>

<style lang="scss">
    @import '@appwrite.io/pink/src/abstract/variables/_common.scss';
    @import '@appwrite.io/pink/src/abstract/variables/_devices.scss';
    @import '@appwrite.io/pink/src/abstract/functions/_pxToRem.scss';

    .hoodie-image {
        border-radius: 1rem;
        width: 100%;
        max-width: 400px;
        height: auto;
        object-fit: contain;
        position: relative;
        z-index: 1;
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
        top: 20%;
        right: 10%;
        translate: -50% -50%;
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
