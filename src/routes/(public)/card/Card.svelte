<script lang="ts" context="module">
    // Helpers
    const round = (num: number, fix = 3) => parseFloat(num.toFixed(fix));
    const clamp = (num: number, min = -20, max = 20) => Math.min(Math.max(num, min), max);

    function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
        return e.type === 'touchmove';
    }
</script>

<script lang="ts">
    import { windowFocusStore } from '$lib/stores/windowFocus';

    import { spring } from 'svelte/motion';

    let cardEl: HTMLDivElement | undefined;
    export let active = false;
    export let isFlipped = false;
    export let base64: { front: string; back: string };

    let interacting = false;

    const springR = { stiffness: 0.066, damping: 0.25 };
    const springD = { stiffness: 0.03, damping: 0.45 };
    const THICKNESS = 3;

    let springRotate = spring({ x: 0, y: 0 }, springR);
    let springGlare = spring({ x: 50, y: 50, o: 0.25 }, springR);
    let springBackground = spring({ x: 50, y: 50 }, springR);
    let springRotateDelta = spring({ x: 0, y: 0 }, springD);
    let springTranslate = spring({ x: 0, y: 0 }, springD);
    let springScale = spring(1, springD);
    let angle = 0;
    let centerProximity = spring(0, springR);
    let springRotateZ = spring(-15, springD);

    // Events
    const interact = (e: MouseEvent | TouchEvent) => {
        if (!active) return;
        interacting = true;

        const clientX = isTouchEvent(e) ? e.touches[0].clientX : e.clientX;
        const clientY = isTouchEvent(e) ? e.touches[0].clientY : e.clientY;

        const el = e.target as HTMLElement;
        const rect = el.getBoundingClientRect(); // get element's current size/position
        const absolute = {
            x: clientX - rect.left, // get mouse position from left
            y: clientY - rect.top // get mouse position from right
        };
        const percent = {
            x: round((100 / rect.width) * absolute.x),
            y: round((100 / rect.height) * absolute.y)
        };
        const center = {
            x: percent.x - 50,
            y: (percent.y - 50) * (isFlipped ? -1 : 1)
        };

        springBackground.stiffness = springR.stiffness;
        springBackground.damping = springR.damping;
        springBackground.set({
            x: round(50 + percent.x / 4 - 12.5),
            y: round(50 + percent.y / 3 - 16.67)
        });
        springRotate.stiffness = springR.stiffness;
        springRotate.damping = springR.damping;
        springRotate.set({
            x: round(-(center.x / 3.5)),
            y: round(center.y / 2)
        });
        springGlare.stiffness = springR.stiffness;
        springGlare.damping = springR.damping;
        springGlare.set({
            x: percent.x,
            y: percent.y,
            o: 1
        });

        // get angle of mouse position relative to center of element
        angle = Math.atan2(center.y, center.x) * (180 / Math.PI);

        // get proximity to center of element. 0 = center, 1 = edge
        $centerProximity = Math.sqrt(center.x * center.x + center.y * center.y) / 50 - 0.1;
    };

    const interactEnd = (_: unknown, delay = 500) => {
        if (!active) return;
        setTimeout(function () {
            const snapStiff = 0.01;
            const snapDamp = 0.06;
            interacting = false;

            springRotate.stiffness = snapStiff;
            springRotate.damping = snapDamp;
            springRotate.set({ x: 0, y: 0 });

            springGlare.stiffness = snapStiff;
            springGlare.damping = snapDamp;
            springGlare.set({ x: 50, y: 50, o: 0 });

            springBackground.stiffness = snapStiff;
            springBackground.damping = snapDamp;
            springBackground.set({ x: 50, y: 50 });
            $centerProximity = 0;
        }, delay);
    };

    const setCenter = () => {
        if (!cardEl) return;
        const rect = cardEl.getBoundingClientRect(); // get element's size/position
        const view = document.documentElement; // get window/viewport size

        const delta = {
            x: round(view.clientWidth / 2 - rect.x - rect.width / 2),
            y: round(view.clientHeight / 2 - rect.y - rect.height / 2)
        };
        springTranslate.set({
            x: delta.x,
            y: delta.y
        });
    };

    const popover = () => {
        if (!cardEl) return;
        const rect = cardEl.getBoundingClientRect(); // get element's size/position
        let delay = 100;
        let scaleW = (window.innerWidth / rect.width) * 0.65;
        let scaleH = (window.innerHeight / rect.height) * 0.65;
        let scaleF = 1.5;
        setCenter();

        delay = 1000;
        springRotateDelta.set({
            x: 360,
            y: 0
        });
        springRotateZ.set(0);

        springScale.set(Math.min(scaleW, scaleH, scaleF));
        interactEnd(null, delay);
    };

    const retreat = () => {
        springScale.set(1);
        springTranslate.set({ x: 0, y: 0 });
        springRotateDelta.set({ x: 0, y: 0 });
        springRotate.set({ x: 0, y: 0 });
        springGlare.set({ x: 50, y: 50, o: 0 });
        $centerProximity = 0;
        springRotateZ.set(-15);
    };

    const handleClick = () => {
        active = !active;
    };

    const windowKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'q') {
            springRotateDelta.update((old) => {
                return {
                    ...old,
                    x: old.x + 360
                };
            });
        }
        if (!active) return;

        if (e.key === 'q') {
            isFlipped = !isFlipped;
        } else if (e.key === 'Escape') {
            active = false;
        }
    };

    $: if (!active) {
        isFlipped = false;
    } else {
        springRotateDelta.update((old) => ({
            x: isFlipped ? 180 : 360,
            y: old.y
        }));
    }

    // Reactive
    $: if (active) {
        popover();
        interacting = true;
    } else {
        retreat();
    }

    windowFocusStore().subscribe((focused) => {
        if (focused) {
            active = false;
            springScale.set(1, { hard: true });
            springTranslate.set({ x: 0, y: 0 }, { hard: true });
            springRotateDelta.set({ x: 0, y: 0 }, { hard: true });
            springRotate.set({ x: 0, y: 0 }, { hard: true });
            springRotateZ.set(-15, { hard: true });
            centerProximity.set(0, { hard: true });
        }
    });

    $: styles = `
		--mx: ${$springGlare.x}%;
		--my: ${$springGlare.y}%;
		--tx: ${$springTranslate.x}px;
		--ty: ${$springTranslate.y}px;
		--s: ${$springScale};
		--o: ${$springGlare.o};
		--rx: ${$springRotate.x + $springRotateDelta.x}deg;
		--ry: ${$springRotate.y + $springRotateDelta.y}deg;
        --rz: ${$springRotateZ}deg;
		--pos: ${$springBackground.x}% ${$springBackground.y}%;
		--posx: ${$springBackground.x}%;
		--posy: ${$springBackground.y}%;
		--hyp: ${clamp(
            Math.sqrt(
                ($springGlare.y - 50) * ($springGlare.y - 50) +
                    ($springGlare.x - 50) * ($springGlare.x - 50)
            ) / 50,
            0,
            1
        )};
		--angle: ${angle}deg;
		--center: ${$centerProximity};
	`;
</script>

<svelte:window on:keydown={windowKeyDown} />

<div class="cb-card" class:active class:interacting style={styles} bind:this={cardEl}>
    <div class="card__translator">
        <button
            class="card__rotator"
            aria-label="Expand the Card"
            tabindex="0"
            on:pointermove={interact}
            on:mouseout={interactEnd}
            on:click={handleClick}
            on:blur={() => {
                /* noop */
            }}>
            <div class="card__back">
                <img
                    class="invisible"
                    src={base64.back}
                    alt="The back of the Card"
                    loading="lazy"
                    width="450"
                    height="274" />
                <img
                    class="abs"
                    src={base64.back}
                    alt="The back of the Card"
                    loading="lazy"
                    width="450"
                    height="274" />
                <div class="card__glare"></div>
            </div>

            {#each new Array(THICKNESS) as _, i (i)}
                <div class="card__thick" style:--i={i + 1}></div>
            {/each}
            <div class="card__front" style:--thickness={THICKNESS}>
                <img class="invisible" src={base64.front} alt="" />
                <img class="abs" src={base64.front} alt="The front of the card" />
                <div class="card__glare"></div>
            </div>
        </button>
    </div>
</div>

<style lang="scss">
    .invisible {
        opacity: 0;
    }
    @media (prefers-reduced-motion: reduce) {
        .cb-card,
        .cb-card * {
            transition: none !important;
            animation: none !important;
            pointer-events: none !important;
        }
    }

    :root {
        --mx: 50%;
        --my: 50%;
        --s: 1;
        --o: 0;
        --tx: 0px;
        --ty: 0px;
        --rx: 0deg;
        --ry: 0deg;
        --pos: 50% 50%;
        --posx: 50%;
        --posy: 50%;
        --hyp: 0;
    }

    :global(.theme-dark) .cb-card {
        --shadow-clr: transparent;
    }

    .cb-card {
        --radius: 12px;
        --shadow-clr: hsl(var(--color-neutral-30));

        z-index: calc(var(--s) * 100);
        transform: translate3d(0, 0, 0.1px);
        -webkit-transform: translate3d(0, 0, 0.1px);
        will-change: transform, visibility;
        transform-style: preserve-3d;
        -webkit-transform-style: preserve-3d;

        &.interacting {
            z-index: calc(var(--s) * 120);
        }
    }

    .cb-card.active .card__translator,
    .cb-card.active .card__rotator {
        touch-action: none;
    }

    .card__translator,
    .card__rotator {
        display: grid;
        perspective: 600px;
        transform-origin: center;
        -webkit-transform-origin: center;
        will-change: transform;
    }

    .card__translator {
        width: auto;
        position: relative;
        transform: translate3d(var(--tx), var(--ty), 0) scale(var(--s));
        -webkit-transform: translate3d(var(--tx), var(--ty), 0) scale(var(--s));
    }

    .card__rotator {
        -webkit-transform: rotateY(var(--rx)) rotateX(var(--ry)) rotateZ(var(--rz));
        -webkit-transform-style: preserve-3d;
        transform: rotateY(var(--rx)) rotateX(var(--ry)) rotateZ(var(--rz));
        transform-style: preserve-3d;
        box-shadow: 0px 10px 20px -5px var(--shadow-clr);
        border-radius: var(--radius);
        outline: none;

        appearance: none;
        -webkit-appearance: none;
        border: none;
        background: top;
        padding: 0;

        :global(*) {
            width: 100%;
            display: grid;
            grid-area: 1/1;
            border-radius: var(--radius);
            image-rendering: optimizeQuality;
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
        }

        img {
            outline: 1px solid transparent;
            height: auto;
        }
    }

    .card__thick {
        background-color: transparent;
        position: absolute;
        width: 100%;
        height: 100%;
        transform: translateZ(calc(var(--i) * 1px));
    }

    .card__back {
        transform: rotateY(180deg) translateZ(0px);
        -webkit-transform: rotateY(180deg) translateZ(0px);
        backface-visibility: hidden;

        &::before {
            --resolved-angle: calc(calc(var(--angle) * -1) + 60deg);
        }
    }

    .card__front {
        opacity: 1;
        transition: opacity 0.33s ease-out;
        transform: translateZ(calc(var(--thickness) * 1px));
        position: relative;

        backface-visibility: hidden;

        * {
            backface-visibility: hidden;
        }

        &::before {
            --resolved-angle: calc(var(--angle) + 65deg);
        }
    }

    .card__front,
    .card__back {
        .abs {
            display: block;
            position: absolute;
            left: 50%;
            top: 50%;
            translate: -50% -50%;
            width: 200%;
            scale: calc(100 / 200);
            max-inline-size: initial;
            max-block-size: initial;
        }
    }

    .card__front::before,
    .card__back::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: conic-gradient(
            from var(--resolved-angle),
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 1) 7.5%,
            rgba(255, 255, 255, 0) 15%
        );
        scale: 1.01;
        border-radius: calc(var(--radius) * 1.2);

        opacity: var(--center);
    }

    .card__glare {
        border-radius: calc(var(--radius) + 3px);
        transform: translateZ(1px);
        z-index: 4;
        background: radial-gradient(
            farthest-corner circle at var(--mx) var(--my),
            rgba(255, 255, 255, 0.8) 10%,
            rgba(255, 255, 255, 0.65) 20%,
            rgba(0, 0, 0, 0.5) 90%
        );
        mix-blend-mode: overlay;
        opacity: calc(var(--o) * 0.5);
    }
</style>
