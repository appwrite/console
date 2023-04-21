<script lang="ts">
    import { Confetti } from 'svelte-confetti';
    import Card from './Card.svelte';

    let triggerConfettiKey = 1;
    const confettiColors = [
        'hsl(var(--color-primary-100))',
        'hsl(var(--color-primary-200))',
        'hsl(var(--color-primary-300))'
    ];
</script>

<div class="wrapper">
    <div class="card">
        <h3 class="heading-level-3">
            Join the celebration
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
            <img src="/images/cloud-beta-hoodies.png" alt="Cloud Beta hoodies" />
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
        <!-- <div class="confetti-wrapper">
            <Confetti
                x={[-2, 2]}
                y={[-2.25, 1.25]}
                amount={50}
                size="10"
                delay={[0, 5000]}
                colorArray={confettiColors}
                fallDistance="50px" />
        </div> -->
        <Card />
    </div>
</div>

<style lang="scss">
    :global(.main-content) {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .wrapper {
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
            background-color: hsl(var(--color-neutral-120));
            padding-inline: 0.75rem; // 12px
            padding-block: 0.25rem; // 4px
            border-radius: 0.375rem; // 6px
        }

        p {
            font-size: 1rem;
        }

        .card-footer {
            display: flex;
            justify-content: flex-end;

            border-top: 1px solid hsl(var(--color-neutral-150));

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

    .confetti-wrapper {
        position: relative;
        // z-index: 9999;
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
</style>
