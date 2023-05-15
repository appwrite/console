<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import CloudDark from './cloud-dark.svg';
    import CloudLight from './cloud-light.svg';
    import HashnodeDark from './hashnode-dark.svg';
    import HashnodeLight from './hashnode-light.svg';
    import Badge from './hackathon-badge.svg';
    import { tooltip } from '$lib/actions/tooltip';
    import { base } from '$app/paths';
</script>

<svelte:head>
    <!-- HTML Meta Tags -->
    <title>Appwrite Cloud - Join Our Hackathon</title>
</svelte:head>

<div class="wrapper">
    <section class="ht-cta">
        <h1 class="ht-title text">
            Join Our
            <br />
            <span class="ht-title-primary">Cloud Hackathon</span>
        </h1>
        <ol class="u-margin-block-start-52 numeric-list">
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
            <Button external href={`${base}/console`}>Get started</Button>
            <Button
                secondary
                external
                href="https://hashnode.com/hackathons/appwrite?utm_campaign=Cloud%20public%20Beta&utm_content=248635813&utm_medium=social&utm_source=twitter&hss_channel=tw-806598100764807170#participate">
                More details
            </Button>
        </div>
        <div class="u-margin-block-start-100">
            <div class="u-only-light buttons-list" />
            <ul class="inline-links">
                <li class="inline-links-item">
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
        <div
            class="card ht-card u-flex u-cross-center u-main-center"
            use:tooltip={{
                content: 'Join us on Cloud Hackathon to unlock this badge'
            }}>
            <img height="200" width="200" src={Badge} alt="hackathon-badge" />
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

    .ht-card {
        aspect-ratio: 1;
        width: 21.25rem;
        height: 21.25rem;
    }
    .ht-title {
        font-size: 3.5rem;
        font-weight: 700;
        line-height: 1.2;

        &-primary {
            color: hsl(var(--color-primary-100));
        }
    }

    @media (max-width: 1024px) {
        .wrapper {
            display: block;
            padding-block: 2rem;

            max-width: min(100%, 500px);
            margin: 0 auto;
        }
        .ht-cta {
            padding-inline: 1rem;
        }
        .ht-img {
            padding: 2rem;
        }
        .ht-card {
            padding: 1rem;
            height: auto;
            width: 100%;
        }
    }

    .numeric-list {
        --p-numeric-border-color: var(--color-neutral-10);
        --p-numeric-bg-color: var(--color-neutral-5);
        --p-numeric-text-color: var(--color-neutral-100);
        counter-reset: number;
        display: grid;
        row-gap: pxToRem(24);
        &-item {
            counter-increment: number;
            display: flex;
            align-items: baseline;
            column-gap: pxToRem(24);
            &::before {
                content: counter(number);
                flex-shrink: 0;
                display: grid;
                place-content: center;
                inline-size: pxToRem(32);
                block-size: pxToRem(32);
                background-color: hsl(var(--p-numeric-bg-color));
                color: hsl(var(--p-numeric-text-color));
                border: solid pxToRem(1) hsl(var(--p-numeric-border-color));
                border-radius: var(--border-radius-circular);
            }
        }
    }
    :global(.theme-dark) {
        .numeric-list {
            --p-numeric-border-color: var(--color-neutral-150);
            --p-numeric-bg-color: var(--color-neutral-200);
            --p-numeric-text-color: var(--color-neutral-50);
        }
    }
</style>
