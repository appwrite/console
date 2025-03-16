<script lang="ts">
    import { base } from '$app/paths';
    import { Avatar, AvatarInitials, Card, Heading } from '$lib/components';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import LoginDark from '$lib/images/login/login-dark-mode.png';
    import LoginLight from '$lib/images/login/login-light-mode.png';
    import type { Coupon } from '$lib/sdk/billing';
    import { app } from '$lib/stores/app';
    import type { Campaign } from '$lib/stores/campaigns';
    import { getCampaignImageUrl } from '$routes/(public)/card/helpers';

    export const imgLight = LoginLight;
    export const imgDark = LoginDark;

    export let campaign: Campaign = null;
    export let coupon: Coupon = null;

    $: variation = ((coupon?.campaign ?? campaign) ? campaign?.template : 'default') as
        | 'default'
        | Campaign['template'];

    let currentReviewNumber = 0;
    $: currentReview = campaign?.reviews?.[currentReviewNumber];

    function generateTitle() {
        if (coupon?.credits) {
            return campaign.title.replace('VALUE', coupon.credits.toString());
        } else {
            return campaign.title;
        }
    }

    function generateDesc() {
        if (coupon?.credits) {
            return campaign.description.replace('VALUE', coupon.credits.toString());
        } else {
            return campaign.description;
        }
    }
</script>

<main class="grid-1-1 is-full-page" id="main">
    <section
        class={`u-flex u-flex-vertical ${variation !== 'default' ? 'u-cross-center u-main-center u-height-100-percent u-width-full-line side-bg' : 'side-default'}`}
        style:--url={variation !== 'default'
            ? ''
            : `url(${$app.themeInUse === 'dark' ? imgDark : imgLight})`}>
        {#if variation !== 'default'}
            <div class="side-bg-container" />
        {/if}
        <div
            class="logo u-flex u-gap-16"
            class:is-not-mobile={variation === 'default'}
            class:logo-variation={variation !== 'default'}>
            <a href={base}>
                {#if $app.themeInUse === 'dark'}
                    <img
                        src={AppwriteLogoDark}
                        width="160"
                        class="u-block u-only-dark"
                        alt="Appwrite Logo" />
                {:else}
                    <img
                        src={AppwriteLogoLight}
                        width="160"
                        class="u-block u-only-light"
                        alt="Appwrite Logo" />
                {/if}
            </a>
        </div>

        {#if variation === 'default'}
            <div class="u-flex u-stretch" />

            <div class="tag-line is-not-mobile">
                <p>Build like a team of hundreds<span class="underscore">_</span></p>
            </div>
        {:else if variation === 'card'}
            <section
                class="u-flex u-flex-vertical u-main-center u-cross-center u-height-100-percent u-width-full-line">
                <img
                    src={getCampaignImageUrl(campaign?.image[$app.themeInUse])}
                    class="u-block u-image-object-fit-cover side-bg-img"
                    alt="promo" />

                <div class="u-text-center auth-container">
                    <div class="is-only-mobile u-width-full-line">
                        <Heading
                            size="5"
                            tag="h3"
                            class="u-margin-block-start-16"
                            trimmed={false}
                            style="font-weight:normal">
                            {generateTitle()}
                        </Heading>
                    </div>
                    <div class="is-not-mobile u-width-full-line">
                        <Heading
                            size="4"
                            tag="h3"
                            class="u-margin-block-start-32"
                            trimmed={false}
                            style="font-weight:normal">
                            {generateTitle()}
                        </Heading>
                    </div>
                    <p class="u-margin-block-start-16">
                        {generateDesc()}
                    </p>
                </div>
            </section>
        {:else if variation === 'review'}
            <section
                class="u-flex u-flex-vertical u-main-center u-cross-center u-height-100-percent u-width-full-line review-container">
                <div class="u-text-center">
                    <div class="is-only-mobile u-width-full-line">
                        <Heading
                            size="5"
                            tag="h3"
                            class="u-margin-block-start-48"
                            trimmed={false}
                            style="font-weight:normal">
                            {generateTitle()}
                        </Heading>
                    </div>
                    <div class="is-not-mobile u-width-full-line">
                        <Heading
                            size="3"
                            tag="h3"
                            class="u-margin-block-start-32"
                            trimmed={false}
                            style="font-weight:normal">
                            {generateTitle()}
                        </Heading>
                    </div>
                </div>

                <p class="body-text-1 u-margin-block-start-16 u-text-center">{generateDesc()}</p>
                <div class="review-container u-margin-block-start-64">
                    <Card style="--p-card-padding: 1.25rem">
                        <p class="body-text-1">
                            {currentReview.review}
                        </p>
                        <div class="u-margin-block-start-16 u-flex u-gap-16">
                            {#if currentReview?.image}
                                <Avatar
                                    src={getCampaignImageUrl(currentReview?.image)}
                                    name={currentReview.name}
                                    size={40} />
                            {:else}
                                <AvatarInitials size={40} name={currentReview.name} />
                            {/if}
                            <div>
                                <p class="body-text-2 u-bold">{currentReview.name}</p>
                                <p class="body-text-2">{currentReview.description}</p>
                            </div>
                        </div>
                    </Card>
                </div>
                {#if campaign?.footer}
                    <div
                        class="u-flex u-gap-16 u-cross-center u-main-center review-footer-container">
                        <p class="u-bold" style:text-transform="uppercase">provided to you by</p>
                        <img
                            style:max-block-size="2.5rem"
                            src={getCampaignImageUrl(campaign?.image[$app.themeInUse])}
                            alt={coupon?.campaign ?? campaign.$id} />
                    </div>
                {/if}
            </section>
        {/if}
    </section>
    <section class="grid-1-1-col-2 u-flex u-flex-vertical u-cross-center u-main-center">
        <slot name="top" />
        <div class="container u-flex u-flex-vertical u-cross-center u-main-center">
            <div class="auth-container u-width-full-line">
                <h1 class="heading-level-4 u-margin-block-start-auto is-not-mobile">
                    <slot name="title" />
                </h1>
                <h1
                    class="heading-level-5 u-margin-block-start-auto is-only-mobile"
                    class:u-padding-block-start-24={variation !== 'default'}>
                    <slot name="title" />
                </h1>
                <div class="u-margin-block-start-24">
                    <slot />
                </div>

                <ul
                    class="inline-links is-center is-with-sep u-margin-block-start-32"
                    class:u-hide={!$$slots?.links}>
                    <slot name="links" />
                </ul>
            </div>
            <div
                class="logo u-flex u-gap-16 u-margin-inline-auto is-only-mobile u-margin-block-start-32">
                <a href={base}>
                    {#if $app.themeInUse === 'dark'}
                        <img
                            src={AppwriteLogoDark}
                            width="93"
                            class="u-block u-only-dark"
                            alt="Appwrite Logo" />
                    {:else}
                        <img
                            src={AppwriteLogoLight}
                            width="93"
                            class="u-block u-only-light"
                            alt="Appwrite Logo" />
                    {/if}
                </a>
            </div>
        </div>
    </section>
</main>

<style lang="scss">
    @use '@appwrite.io/pink/src/abstract/variables/devices';

    .side-bg {
        position: relative;
        overflow: hidden;
        z-index: 1;
        height: 100%;
        width: 100%;
        padding-block: 2rem;
        padding-inline: 1rem;
        background-color: #ededf0 !important;

        &-container {
            position: absolute;
            inset: 0;
            block-size: 100%;
            inline-size: 100%;
            z-index: -1;
            &::before {
                position: absolute;
                inset-block-start: -200px;
                inset-inline-end: -50px;
                content: '';
                display: block;
                inline-size: 32%;
                block-size: 32%;
                background: radial-gradient(49.55% 43.54% at 47% 50.69%, #e7f8f7 0%, #85dbd8 100%);
                filter: blur(150px);
                @media #{devices.$break1} {
                    filter: blur(100px);
                }
            }
            &::after {
                position: absolute;
                inset-block-end: -50px;
                inset-inline-start: -50px;
                content: '';
                display: block;
                inline-size: 30%;
                block-size: 30%;
                background: radial-gradient(
                    50% 46.73% at 50% 53.27%,
                    #fe9567 28.17%,
                    #fd366e 59.38%
                );
                filter: blur(200px);

                @media #{devices.$break1} {
                    filter: blur(100px);
                }
            }
        }
        &-img {
            padding-inline: 6.25rem;
            max-width: 40rem;
            @media #{devices.$break2} {
                max-width: 28rem;
            }
            @media #{devices.$break1} {
                margin-block-start: 3rem;
                max-inline-size: 23rem;
                padding-inline: 4rem;
            }
        }
    }
    :global(.theme-dark) .side-bg {
        background-color: #131315 !important;
    }

    :global(.theme-dark) .side-bg-container::before {
        inline-size: 20%;
        block-size: 20%;
        filter: blur(180px);
    }
    :global(.theme-dark) .side-bg-container::after {
        filter: blur(250px);
    }

    /* Default (including mobile) */
    .side-default {
        padding-block-start: 2.25rem;
        padding-block-end: 2rem;

        div {
            padding-inline-start: 1rem;
            padding-inline-end: 1rem;
        }

        .tag-line {
            font-family: 'Aeonik Pro';
            font-size: 4rem;
            font-style: normal;
            font-weight: 400;
            line-height: 100%; /* 80px */
            letter-spacing: -1.6px;
            backdrop-filter: blur(0.5 rem);
            .underscore {
                -webkit-text-fill-color: #f02e65;
            }
        }
    }

    /* for smaller screens */
    @media #{devices.$break2open} {
        .side-default {
            background: var(--url);
            background-repeat: no-repeat;
            background-position: top;
            background-size: cover;

            padding-block-start: 6.25rem;
            padding-block-end: 6.875rem;

            div {
                padding-inline-start: 2.625rem;
                padding-inline-end: 2rem;
            }
        }
    }

    /* for larger screens */
    @media #{devices.$break3open} {
        .side-default {
            div {
                padding-inline-start: 5.625rem;
                padding-inline-end: 5rem;
            }
            .tag-line {
                font-size: 5rem;
            }
        }
    }

    :global(.theme-dark) .tag-line {
        background: linear-gradient(45deg, white, white 60%, #fd376f);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    :global(.theme-light) .tag-line {
        background: linear-gradient(45deg, #19191d, #19191d 60%, #fd376f);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .auth-container {
        max-inline-size: 27.5rem;
    }
    .review-container {
        max-inline-size: 30rem;
    }
    .logo-variation {
        padding-block-start: 2rem;

        @media #{devices.$break1} {
            padding-block-start: 0rem;
            & img {
                scale: 0.7;
            }
        }
    }

    .review-footer-container {
        padding-block-start: 10rem;
        @media #{devices.$break1} {
            padding-block-start: 5rem;
        }
    }
</style>
