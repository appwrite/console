<script lang="ts">
    import { Confetti } from 'svelte-confetti';
    import Card from './Card.svelte';
    import { fade } from 'svelte/transition';

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

<div class="wrapper">
    <div class="card">
        <h3 class="heading-level-3">
            Welcome to the Cloud Club
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
        <div class="u-flex u-margin-block-start-40 u-cross-center u-gap-24">
            <div class="hoodie-container">
                <img src="/images/hoodie-1.png" alt="Cloud Beta hoodies" />
                <img src="/images/hoodie-2.png" alt="Cloud Beta hoodies" />
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
        <ul class="buttons-list u-margin-block-start-32">
            <li class="buttons-list-item">
                <button class="button is-text">
                    <span class="icon-twitter" aria-hidden="true" />
                    <span class="text">Share</span>
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
            <a href="/console" class="button">Back to console</a>
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
        <Card bind:active={cardActive} bind:isFlipped={cardIsFlipped} />
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
            <span class="icon-refresh" aria-hidden="true" />
            <span class="text">Spin</span>
        </button>
    </div>
</div>

<style lang="scss">
    :global(.main-content) {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
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
        gap: 8rem;
        overflow: hidden;
    }

    .card {
        max-width: 660px;

        img {
            width: 159px;
            height: 118px;
        }

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
            background-image: url('/images/hoodies-bg.png');
            background-size: contain;
            background-repeat: no-repeat;
            position: relative;
            width: 9.9375rem; // 159px
            height: 7.375rem; // 118px
            flex-shrink: 0;

            transition: 300ms ease;

            img {
                display: block;
                position: absolute;
                object-fit: contain;
                width: 5.8125rem; // 93px
                height: 5.8125rem; // 93px

                transition: 300ms ease;

                &:first-child {
                    top: 1rem;
                    left: 0.1875rem;
                }

                &:last-child {
                    top: 0.5625rem; // 9px
                    right: 0.1875rem; // 3px
                }
            }

            &:hover {
                box-shadow: 0 0 30px var(--glow);

                img:first-child {
                    scale: 1.5;
                    rotate: -5deg;
                    translate: -1rem 1rem;
                }

                img:last-child {
                    scale: 1.5;
                    rotate: 5deg;
                    translate: 1rem -1rem;
                }
            }
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

    h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
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
</style>
