<script>
    import { cubicInOut } from 'svelte/easing';
    import { draw, fade } from 'svelte/transition';
</script>

<div style:width="40px" style:height="40px">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
        <g
            filter="url(#a)"
            style:animation-name="rotate"
            style:animation-duration="1.5s"
            style:animation-iteration-count="infinite"
            style:transform-origin="center">
            <circle
                cx="10"
                cy="10"
                r="8"
                fill="var(--bgcolor-accent)"
                fill-opacity=".08"
                in:fade={{ duration: 250, delay: 1000 }} />
            <circle
                in:draw={{ duration: 1250, easing: cubicInOut }}
                style:rotate="-90deg"
                style:transform-origin="center"
                cx="10"
                cy="10"
                r="8"
                stroke="var(--bgcolor-accent)"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-opacity=".32"
                stroke-width="1.2" />
        </g>
        <path
            in:draw={{ duration: 1000 }}
            stroke="var(--fgcolor-accent)"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.2"
            d="m6.25 11.5 2.5 2 5-6.5" />

        <defs>
            <filter
                id="a"
                width="25.199"
                height="25.203"
                x="-2.6"
                y="-2.602"
                color-interpolation-filters="sRGB"
                filterUnits="userSpaceOnUse">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feGaussianBlur in="BackgroundImageFix" stdDeviation="2" />
                <feComposite
                    in2="SourceAlpha"
                    operator="in"
                    result="effect1_backgroundBlur_1449_7567" />
                <feBlend in="SourceGraphic" in2="effect1_backgroundBlur_1449_7567" result="shape" />
            </filter>
        </defs>
    </svg>
</div>

<style>
    @keyframes rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
