<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import CloudDark from './cloud-dark.svg';
    import CloudLight from './cloud-light.svg';
    import HashnodeDark from './hashnode-dark.svg';
    import HashnodeLight from './hashnode-light.svg';
    import Badge from './hackathon-badge.svg';
    import { base } from '$app/paths';
    import { Tooltip } from '@appwrite.io/pink-svelte';
</script>

<svelte:head>
    <!-- HTML Meta Tags -->
    <title>Appwrite Cloud - Join Our Hackathon</title>
</svelte:head>

<div class="wrapper">
    <section class="ht-cta">
        <h1 class="heading-level-1 ht-title text">
            Join Our
            <br />
            <span class="ht-title-primary">Cloud Hackathon</span>
        </h1>
        <ol class="numeric-list">
            <li class="numeric-list-item">
                <span class="text"> Build an open-source app using Appwrite Cloud</span>
            </li>
            <li class="numeric-list-item">
                <span class="text"> Publish an article on your Hashnode blog </span>
            </li>
            <li class="numeric-list-item">
                <span class="text">
                    Submit your project on <a
                        class="link"
                        href="https://builtwith.appwrite.io"
                        target="_blank"
                        rel="noopener noreferrer">Built with Appwrite</a>
                </span>
            </li>
        </ol>
        <div class="u-margin-block-start-32 u-flex u-gap-16">
            <Button external href={base}>Go to console</Button>
            <Button
                secondary
                external
                href="https://hashnode.com/hackathons/appwrite?utm_campaign=Cloud%20public%20Beta&utm_content=248635813&utm_medium=social&utm_source=twitter&hss_channel=tw-806598100764807170#participate">
                More details
            </Button>
        </div>
        <div class="ht-logos">
            <div class="u-only-light buttons-list"></div>
            <ul class="inline-links">
                <li class="inline-links-item" style="padding-inline-start: 0;">
                    <div class="u-only-light">
                        <img src={CloudLight} alt="Appwrite Cloud" height="15" width="170" />
                    </div>
                    <div class="u-only-dark">
                        <img src={CloudDark} alt="Appwrite Cloud" height="15" width="170" />
                    </div>
                </li>
                <li class="inline-links-item">
                    <div class="u-only-light">
                        <img src={HashnodeLight} alt="Hashnode" height="17" width="99" />
                    </div>
                    <div class="u-only-dark">
                        <img src={HashnodeDark} alt="Hashnode" height="17" width="99" />
                    </div>
                </li>
            </ul>
        </div>
    </section>
    <section class="ht-img">
        <div class="card ht-card ht-card-main u-flex u-cross-center u-main-center">
            <Tooltip>
                <img height="200" width="200" src={Badge} alt="hackathon-badge" />
                <span slot="tooltip">Join the hackathon to unlock this badge</span>
            </Tooltip>
        </div>
        <div class="card ht-card u-flex u-flex-vertical">
            <div class="ht-tag ht-tag-primary u-cross-child-center">
                <span class=" u-uppercase eyebrow-heading-3">Grand winner</span>
            </div>
            <h4 class="u-flex u-cross-center u-gap-4 u-margin-block-start-20">
                <span class="heading-level-4">5,000</span><span class="heading-level-7">USD</span>
            </h4>

            <div class="u-flex u-flex-vertical u-gap-8 u-margin-block-start-16">
                <p class="ht-text">+ Appwrite swag</p>
                <p class="ht-text">+ Hashnode T-shirt & mug</p>
            </div>
        </div>
        <div class="card ht-card u-flex u-flex-vertical">
            <div class="ht-tag u-cross-child-center">
                <span class=" u-uppercase eyebrow-heading-3 u-bold">5 Runner-ups Each</span>
            </div>
            <h4 class="u-flex u-cross-center u-gap-4 u-margin-block-start-20">
                <span class="heading-level-4">1,000</span><span class="heading-level-7">USD</span>
            </h4>
            <div class="u-flex u-flex-vertical u-gap-8 u-margin-block-start-16">
                <p class="ht-text">+ Appwrite swag</p>
                <p class="ht-text">+ Hashnode T-shirt</p>
            </div>
        </div>
    </section>
</div>

<style lang="scss">
    :global(.main-content) {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        flex-grow: 1;
    }

    .wrapper {
        display: grid;
        place-items: center;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        position: relative;

        grid-template-columns: 1fr 1fr;
        padding-block: 4rem;
        gap: max(4rem, 10vw);
        overflow: hidden;
    }

    .ht-cta {
        padding-inline-start: 4rem;
    }

    .ht-img {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        padding-inline: 1rem;
    }
    .ht-card {
        &-main {
            grid-column: 1/ -1;
            aspect-ratio: 1;
            width: 33rem;
            height: 16.5rem;
        }
    }
    .ht-title {
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 1.2;
        margin-block-end: 2.5rem;
        &-primary {
            color: hsl(var(--color-primary-100));
        }
    }

    .ht-tag {
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
        background-color: hsl(var(--color-neutral-70));
        text-align: center;

        &-primary {
            background-color: hsl(var(--color-primary-100));
        }

        span {
            color: hsl(var(--color-neutral-0));
        }
    }

    .ht-logos {
        margin-block-start: 5rem;
    }
    @media (max-width: 1068px) {
        .wrapper {
            display: block;
            padding-block: 1rem;

            max-width: min(100%, 500px);
            margin: 0 auto;
        }
        .ht-title {
            font-size: 2.5rem;
            margin-block-end: 2rem;
        }
        .ht-cta {
            padding-inline: 1rem;
        }
        .ht-img {
            grid-template-columns: 1fr;
            padding: 0 1rem;
            h4,
            div {
                justify-content: center;
                align-items: center;
            }
        }
        .ht-card {
            width: 100%;
        }
        .ht-logos {
            margin-block: 2.5rem;
        }
    }

    .numeric-list {
        --p-numeric-border-color: var(--color-neutral-30);
        --p-numeric-bg-color: var(--color-neutral-10);
        --p-numeric-text-color: var(--color-neutral-100);
        counter-reset: number;
        display: grid;
        row-gap: 1.5rem;
        &-item {
            counter-increment: number;
            display: flex;
            align-items: baseline;
            column-gap: 1.5rem;

            &::before {
                content: counter(number);
                flex-shrink: 0;
                display: grid;
                place-content: center;
                inline-size: 2rem;
                block-size: 2rem;
                background-color: hsl(var(--p-numeric-bg-color));
                color: hsl(var(--p-numeric-text-color));
                border: 1px solid hsl(var(--p-numeric-border-color));
                border-radius: var(--border-radius-circular);
            }
        }
    }
    :global(.theme-dark) {
        .ht-text {
            color: hsl(var(--color-neutral-0));
        }
        .ht-tag {
            background-color: hsl(var(--color-neutral-150));
            &-primary {
                background-color: hsl(var(--color-primary-100));
            }
        }
        .card {
            background-color: hsl(var(--color-neutral-300));
        }
        .numeric-list {
            --p-numeric-border-color: var(--color-neutral-150);
            --p-numeric-bg-color: var(--color-neutral-200);
            --p-numeric-text-color: var(--color-neutral-50);
            &-item {
                color: hsl(var(--color-neutral-30));
            }
        }
    }
</style>
