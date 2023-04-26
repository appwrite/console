<script lang="ts">
    import { Confetti } from 'svelte-confetti';
    import Card from './Card.svelte';
    import { fade } from 'svelte/transition';

    export let data;

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
</script>

<div class="main-content">
    <div class="wrapper">
        <div class="card">
            <h3 class="heading-level-3 u-flex u-cross-center u-gap-8">
                Welcome to the Cloud
                <button class="confetti-btn" on:click={() => triggerConfettiKey++}>
                    🎉
                    {#each Array(triggerConfettiKey) as _, i (i)}
                        <Confetti
                            delay={i === 0 ? [500, 500] : [0, 100]}
                            x={[0.5, 2]}
                            y={[0, 1.5]}
                            amount="30"
                            fallDistance="50px"
                            colorArray={confettiColors} />
                    {/each}
                </button>
            </h3>

            <div class="content">
                <div class="hoodie-container">
                    <img
                        src="/images/hoodies-bg.png"
                        alt="red background"
                        aria-hidden="true"
                        class="bg" />
                    <img src="/images/hoodie-1.png" class="hoodie" alt="Cloud Beta hoodies" />
                    <img src="/images/hoodie-2.png" class="hoodie" alt="Cloud Beta hoodies" />
                </div>
                <div>
                    <div class="u-flex u-cross-center u-gap-8">
                        <h4 class="eyebrow-heading-1">Cloud is live in public</h4>
                        <h4 class="eyebrow-heading-1 beta-tag">Beta</h4>
                    </div>
                    <p class="u-margin-block-start-8">
                        Share your Cloud card and you may win an exclusive Cloud hoodie!
                    </p>
                </div>
            </div>
            <img class="card-preview" src="/images/front.png" alt="The front of the card" />
            <ul class="buttons-list u-margin-block-start-32">
                <li class="buttons-list-item">
                    <button class="button is-text">
                        <span class="icon-twitter" aria-hidden="true" />
                        <span class="text">Tweet it</span>
                    </button>
                </li>
                <li class="buttons-list-item">
                    <button class="button is-text">
                        <span class="icon-code" aria-hidden="true" />
                        <span class="text">Get embed code</span>
                    </button>
                </li>
                <li class="buttons-list-item">
                    <button class="button is-text">
                        <span class="icon-link" aria-hidden="true" />
                        <span class="text">Get a link</span>
                    </button>
                </li>
            </ul>
            <div class="card-footer">
                <a href="/console" class="button">Go to console</a>
            </div>
        </div>
        <div class="cbc-wrapper">
            {#if !cardActive}
                <div transition:fade>
                    <Confetti
                        x={[-1.75, 1.85]}
                        y={[-1.875, 1]}
                        amount={100}
                        size="10"
                        infinite
                        delay={[2000, 7000]}
                        colorArray={confettiColors}
                        fallDistance="50px" />
                </div>
            {/if}
            <Card
                bind:active={cardActive}
                bind:isFlipped={cardIsFlipped}
                userId={data.account.$id} />
        </div>
        {#if cardActive}
            <div
                class="overlay"
                on:click={() => (cardActive = false)}
                on:keydown={() => {
                    /* no-op */
                }}
                transition:fade />
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
</div>

<style lang="scss">
    .main-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;

        min-height: 100vh;
    }

    :global(.theme-dark) .wrapper {
        --glow: hsl(var(--color-primary-100));
        --beta-bg: hsl(var(--color-neutral-120));
        --beta-fg: hsl(var(--color-neutral-0));
        --sep-clr: hsl(var(--color-neutral-150));
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

        grid-template-columns: 600px 400px;
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

            .beta-tag {
                background-color: var(--beta-bg);
                color: var(--beta-fg);
                padding-inline: 0.75rem; // 12px
                padding-block: 0.25rem; // 4px
                border-radius: 0.375rem; // 6px
            }

            p {
                font-size: 1rem;
            }

            .hoodie-container {
                position: relative;
                flex-shrink: 0;

                .bg {
                    display: block;
                    width: 9.9375rem; // 159px
                    height: 7.375rem; // 118px
                    aspect-ratio: 358 / 265.69;

                    background-color: #ec2f65;
                    border-radius: 12px;
                    transition: 300ms ease;
                }

                .hoodie {
                    display: block;
                    position: absolute;
                    object-fit: contain;
                    width: 5.8125rem; // 93px
                    height: 5.8125rem; // 93px

                    transition: 300ms ease;

                    &:nth-child(2) {
                        top: 1rem;
                        left: 0.1875rem;
                    }

                    &:nth-child(3) {
                        top: 0.5625rem; // 9px
                        right: 0.1875rem; // 3px
                    }
                }

                &:hover {
                    .bg {
                        box-shadow: 0 0 30px var(--glow);
                    }

                    .hoodie:nth-child(2) {
                        scale: 1.5;
                        rotate: -5deg;
                        translate: -1rem 1rem;
                    }

                    .hoodie:nth-child(3) {
                        scale: 1.5;
                        rotate: 5deg;
                        translate: 1rem -1rem;
                    }
                }
            }
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
        display: grid;
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
        top: 80%;
        left: 50%;
        translate: -50% -50%;

        transition: opacity 250ms ease;

        &.invisible {
            opacity: 0;
        }
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

    @media (max-width: 1024px) {
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
                border-block-end: 1px solid var(--sep-clr);

                .hoodie-container {
                    .bg {
                        width: 100%;
                        height: auto;
                    }

                    .hoodie {
                        width: 65%;
                        height: auto;

                        &:nth-child(2) {
                            top: 10%;
                            left: 0;
                        }

                        &:nth-child(3) {
                            top: 0%;
                            right: 0;
                        }
                    }

                    &:hover {
                        .hoodie:nth-child(2) {
                            scale: 1.25;
                        }

                        .hoodie:nth-child(3) {
                            scale: 1.25;
                        }
                    }
                }
            }

            .card-preview {
                display: block;
                margin-block-start: 2rem;
            }

            .buttons-list {
                flex-wrap: wrap;
                justify-content: center;

                .buttons-list-item {
                    border: none !important;
                }
            }

            .card-footer {
                border: none;

                .button {
                    display: grid;
                    place-items: center;
                    text-align: center;
                    width: 100%;
                }
            }
        }

        .confetti-btn {
            display: none;
        }

        .cbc-wrapper {
            display: none;
        }
    }
</style>
