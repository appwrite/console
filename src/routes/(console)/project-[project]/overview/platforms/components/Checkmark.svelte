<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
    <circle class="circle" cx="12.5" cy="12.5" r="12" fill="none" />
    <path class="check" fill="none" d="M6.77 13.08l3.4 3.46 8.02-8.08" />
</svg>

<style lang="scss">
    .checkmark {
        --checkmark-size: 25px;
        --brand-pink: rgba(152, 32, 66, 10%);
        width: var(--checkmark-size);

        height: var(--checkmark-size);
        border-radius: 50%;
        display: block;
        flex-shrink: 0;
        stroke-width: 1;
        stroke: #fff;
        stroke-miterlimit: 10;
        margin: 10% auto;
        box-shadow: inset 0px 0px 0px var(--brank-pink);
        animation: scale 0.5s ease-in-out 0.9s both;

        .circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 2;
            stroke-miterlimit: 10;
            stroke: var(--color-bgcolor-accent-secondary);
            fill: none;
            animation: stroke 0.75s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: stroke 0.5s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
    }
    @keyframes stroke {
        100% {
            stroke-dashoffset: 0;
        }
    }
    @keyframes scale {
        0%,
        100% {
            transform: none;
        }
        50% {
            transform: scale3d(1.1, 1.1, 1);
        }
    }
</style>
