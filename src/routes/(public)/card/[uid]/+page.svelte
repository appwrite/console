<script lang="ts">
    import { browser } from '$app/environment';
    import { Modal } from '$lib/components';
    import Code from '$lib/components/code.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { copy } from '$lib/helpers/copy';
    import { addNotification } from '$lib/stores/notifications';
    import { Confetti } from 'svelte-confetti';
    import { fade } from 'svelte/transition';
    import Card from '../Card.svelte';
    import { base } from '$app/paths';

    export let data;
    const base64 = data.base64;
    const variant = data.isOwner ? 'owner' : 'external';
    const userId = data.userId;
    const { frontImg } = data.imgUrls;

    let triggerConfettiKey = 1;
    const confettiColors = [
        'hsl(var(--color-primary-100))',
        'hsl(var(--color-primary-200))',
        'hsl(var(--color-primary-300))',
        '#F05088',
        '#FF86BB',
        '#FFFFFF80'
    ];

    let cardActive = false;
    let cardIsFlipped = false;
    let showEmbedCode = false;

    $: title =
        variant === 'owner' ? 'Welcome to Cloud Public Beta' : 'Join Appwrite Cloud Public Beta';
    $: shareableLink =
        typeof window !== 'undefined' ? `${window.location.origin}/card/${userId}` : '';
    $: embedCode = [
        `<a href="${shareableLink}">`,
        `\t<img width="350" src="${frontImg}" alt="Appwrite Cloud Card" />`,
        `</a>`
    ].join('\n');
    $: twitterText = encodeURIComponent(
        [
            `Guess what I just received? 💳 My personalized Cloud card from @appwrite! 🚀`,
            ``,
            `Appwrite Cloud just announced their Public Beta!`,
            ``,
            `🌥️ Sign up now and claim your own card at ${shareableLink}`,
            ``,
            `#AppwriteCloud`
        ].join('\n')
    );

    function copyShareableLink() {
        copy(shareableLink);
        addNotification({
            message: 'The link has been copied',
            type: 'success'
        });
    }

    function copyEmbedCode() {
        copy(embedCode);
        addNotification({
            message: 'Embed code has been copied',
            type: 'success'
        });
        showEmbedCode = false;
    }

    const seo = {
        title: 'Appwrite Cloud Card',
        description:
            'Cloud is live in public beta, create your Cloud account and unlock your exclusive card!'
    };
</script>

<svelte:head>
    <!-- HTML Meta Tags -->
    <title>{seo.title}</title>
    <meta name="description" content={seo.description} />
</svelte:head>

<div class="wrapper">
    <div class="card">
        <h3 class="heading-level-3 no-text-select">
            {title}
            <button class="confetti-btn" on:click={() => triggerConfettiKey++}>
                🎉
                {#each Array(triggerConfettiKey) as _, i (i)}
                    <Confetti
                        delay={i === 0 ? [500, 500] : [0, 100]}
                        x={[0.5, 2]}
                        y={[0, 1.5]}
                        amount={30}
                        fallDistance="50px"
                        colorArray={confettiColors} />
                {/each}
            </button>
        </h3>

        <div class="content">
            <div>
                {#if variant === 'owner'}
                    <h4 class="eyebrow-heading-3 is-only-desktop">Share your card</h4>
                {:else if variant === 'external'}
                    <h4 class="eyebrow-heading-3 is-only-desktop">Share card</h4>
                {/if}
                {#if variant === 'external'}
                    <a
                        href={`${base}/register`}
                        class="button u-width-full-line u-main-center u-margin-block-start-16 external-btn-top"
                        data-sveltekit-reload>Claim your card</a>
                {/if}
            </div>
        </div>
        <img class="card-preview" src={base64.front} alt="The front of the card" />
        <ul class="buttons-list u-margin-block-start-16">
            <li class="buttons-list-item">
                <a
                    class="button is-text"
                    href="https://twitter.com/intent/tweet?text={twitterText}"
                    target="_blank"
                    rel="noreferrer">
                    <span class="icon-twitter" aria-hidden="true"></span>
                    <span class="text">Tweet it</span>
                </a>
            </li>
            {#if variant === 'owner'}
                <li class="buttons-list-item embed-btn">
                    <button class="button is-text" on:click={() => (showEmbedCode = true)}>
                        <span class="icon-code" aria-hidden="true"></span>
                        <span class="text">Get embed code</span>
                    </button>
                </li>
            {/if}
            <li class="buttons-list-item">
                <button class="button is-text" on:click={copyShareableLink}>
                    <span class="icon-link" aria-hidden="true"></span>
                    <span class="text">Get a link</span>
                </button>
            </li>
        </ul>
        <div class="card-footer">
            {#if variant === 'owner'}
                <a data-sveltekit-reload href={base} class="button">Go to console</a>
            {:else}
                <a data-sveltekit-reload href={`${base}/card`} class="button external-btn-bottom"
                    >Claim your card</a>
            {/if}
        </div>
    </div>
    <div class="cbc-wrapper">
        {#if !cardActive}
            <div class="cbc-confetti" transition:fade>
                <Confetti
                    x={[-1.75, 1.85]}
                    y={[-1.875, 1]}
                    amount={100}
                    size={10}
                    infinite
                    delay={[2000, 7000]}
                    colorArray={confettiColors}
                    fallDistance="50px" />
            </div>
        {/if}
        {#if browser}
            <Card bind:active={cardActive} bind:isFlipped={cardIsFlipped} {base64} />
        {/if}
    </div>
    {#if cardActive}
        <div
            class="overlay"
            on:click={() => (cardActive = false)}
            on:keydown={() => {
                /* no-op */
            }}
            transition:fade
            role="button"
            tabindex="0">
        </div>
    {/if}
    <div class="controls" class:invisible={!cardActive}>
        <button
            class="button is-text"
            on:click={() => (cardIsFlipped = !cardIsFlipped)}
            aria-label="Rotate card">
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2 11C2 8.2 6.5 6 12 6C17.5 6 22 8.2 22 11C22 12.8414 20.0779 14.3752 17.2449 15.2644C16.615 15.4621 16 14.9707 16 14.3105C16 13.8351 16.3283 13.4267 16.7816 13.2837C18.8093 12.6442 20 11.6237 20 11C20 9.9 17 8 12 8C7 8 4 9.9 4 11C4 11.7821 6.79551 13.1137 9.91054 13.7336C10.0265 13.7566 10.1405 13.7886 10.2509 13.8305C10.308 13.8187 10.3669 13.8125 10.4273 13.8125L9.26357 12.6004C8.9121 12.2343 8.9121 11.6407 9.26357 11.2746C9.61504 10.9085 10.1849 10.9085 10.5364 11.2746L13.2364 14.0871C13.4051 14.2629 13.5 14.5013 13.5 14.75C13.5 14.9986 13.4051 15.2371 13.2364 15.4129L10.5364 18.2254C10.1849 18.5915 9.61504 18.5915 9.26357 18.2254C8.9121 17.8593 8.9121 17.2657 9.26357 16.8996L10.2838 15.8369C6.24683 15.1056 2 13.1614 2 11Z"
                    fill="currentColor" />
            </svg>
            <span class="text">Spin</span>
        </button>
    </div>
</div>

<Modal title="Get Embed Code" bind:show={showEmbedCode}>
    <div class="u-overflow-hidden">
        <Code language="html" code={embedCode} noMargin />
    </div>
    <svelte:fragment slot="footer">
        <Button on:click={copyEmbedCode}>Copy</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    :global(.theme-dark) .wrapper {
        --glow: hsl(var(--color-primary-100));
        --beta-bg: hsl(var(--color-neutral-120));
        --beta-fg: hsl(var(--color-neutral-0));
        --sep-clr: hsl(var(--color-neutral-150));
    }

    :global(.main-content) {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        flex-grow: 1;
    }

    .wrapper {
        --glow: transparent;
        --beta-bg: rgba(240, 46, 101, 0.16);
        --beta-fg: rgba(240, 46, 101, 0.8);
        --sep-clr: hsl(var(--color-neutral-10));

        display: grid;
        place-items: center;
        justify-content: center;
        flex-grow: 1;
        position: relative;

        grid-template-columns: 620px 400px;
        padding-block: 4rem;
        gap: max(4rem, 10vw);
        overflow: hidden;
    }

    .card {
        max-width: 660px;

        .content {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-block-start: 2.5rem;
        }

        .card-preview {
            display: none;
        }

        .card-footer {
            display: flex;
            justify-content: flex-end;

            border-top: 1px solid var(--sep-clr);

            margin-block-start: 2rem;
            padding-block-start: 2rem;
            margin-inline: -2rem;
            padding-inline: 2rem;
        }
    }

    .cbc-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 500px;
        position: relative;
    }

    .cbc-confetti {
        position: absolute;
        top: 30%;
        left: 50%;
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

    .confetti-btn {
        animation: shake 2000ms ease infinite;
        user-select: none;
        display: inline-flex;
        place-items: center;
        position: relative;

        :global(.confetti-holder) {
            position: absolute !important;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        position: absolute;
        bottom: 5vh;
        left: 50%;
        translate: -50%;

        transition: opacity 250ms ease;

        &.invisible {
            opacity: 0;
        }
    }

    .buttons-list-item:first-child .button {
        padding-inline-start: 0;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        background-color: hsl(var(--p-body-bg-color));
        backdrop-filter: blur(80px);
        opacity: 0.5;
    }

    .external-btn-top {
        display: none;
    }

    .no-text-select {
        user-select: none;
    }

    @media (max-width: 1024px) {
        .external-btn-top {
            display: flex;
        }

        .external-btn-bottom {
            display: none !important;
        }

        .embed-btn {
            order: 2;
            border: none !important;
        }

        .wrapper {
            display: block;
            padding-block: 2rem;

            max-width: min(100%, 500px);
            margin: 0 auto;
        }

        .card {
            background-color: transparent;
            border: none;
            padding-inline: 1rem;
            padding-block: 0;

            .content {
                flex-direction: column;
                align-items: stretch;
                margin-block-start: 1rem;
                padding-block-end: 2rem;
                // border-block-end: 1px solid var(--sep-clr);
            }

            .card-preview {
                display: block;
                margin-block-start: 2rem;
            }

            .buttons-list {
                flex-wrap: wrap;
                justify-content: center;

                .buttons-list-item:last-child {
                    border: none !important;
                }
            }

            .card-footer {
                border: none;
                padding-block-start: 0;

                .button {
                    display: grid;
                    place-items: center;
                    text-align: center;
                    width: 100%;
                }
            }
        }

        .cbc-wrapper {
            display: none;
        }
    }
</style>
