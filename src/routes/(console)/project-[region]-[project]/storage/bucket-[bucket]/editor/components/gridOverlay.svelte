<script lang="ts">
    let {
        type = 'rule-of-thirds',
        lineColor = 'rgba(255, 255, 255, 0.3)',
        lineWidth = 1
    }: {
        type?: 'rule-of-thirds' | 'dots';
        lineColor?: string;
        lineWidth?: number;
    } = $props();
</script>

<div class="grid-overlay">
    {#if type === 'rule-of-thirds'}
        <!-- Rule of thirds grid lines -->
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="grid-svg">
            <!-- Vertical lines -->
            <line
                x1="33.33%"
                y1="0"
                x2="33.33%"
                y2="100%"
                stroke={lineColor}
                stroke-width={lineWidth}
                vector-effect="non-scaling-stroke" />
            <line
                x1="66.66%"
                y1="0"
                x2="66.66%"
                y2="100%"
                stroke={lineColor}
                stroke-width={lineWidth}
                vector-effect="non-scaling-stroke" />
            <!-- Horizontal lines -->
            <line
                x1="0"
                y1="33.33%"
                x2="100%"
                y2="33.33%"
                stroke={lineColor}
                stroke-width={lineWidth}
                vector-effect="non-scaling-stroke" />
            <line
                x1="0"
                y1="66.66%"
                x2="100%"
                y2="66.66%"
                stroke={lineColor}
                stroke-width={lineWidth}
                vector-effect="non-scaling-stroke" />
        </svg>
    {:else if type === 'dots'}
        <!-- Dot grid pattern (similar to Tela's approach) -->
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="grid-svg">
            <defs>
                <pattern
                    id="dotGrid"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill={lineColor} />
                </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>
    {/if}
</div>

<style>
    .grid-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1;
        will-change: transform;
        contain: strict;
    }

    .grid-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>

