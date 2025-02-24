<div class="glow-card">
    <div class="glow" />
</div>

<style>
    .glow-card {
        position: absolute;
        inset: 0;
        border: 1px solid transparent;
        mask-clip: padding-box, border-box;
        mask-composite: intersect;
        border-radius: var(--border-radius-m);
        mask-image: linear-gradient(transparent, transparent), linear-gradient(#000, #000);

        .glow {
            position: absolute;
            inset: 0;
            width: 60px;
            aspect-ratio: 1/1;
            offset-path: rect(0 auto auto 0 round 60px);
            offset-distance: 0;
            offset-rotate: auto;
            animation: glow 6s infinite linear forwards;
            background-color: var(--color-bgcolor-accent-tertiary);
            box-shadow:
                var(--color-bgcolor-accent-tertiary) 0px 0px 60px 30px,
                var(--color-bgcolor-accent-tertiary) 0px 0px 100px 60px,
                var(--color-bgcolor-accent-tertiary) 0px 0px 140px 90px;
        }

        @keyframes glow {
            0% {
                offset-distance: 0;
            }
            100% {
                offset-distance: 100%;
            }
        }
    }
</style>
