<script lang="ts">
    import { onDestroy } from 'svelte';
    import { ID } from '@appwrite.io/console';
    import { debounce } from '$lib/helpers/debounce';
    import { Badge } from '@appwrite.io/pink-svelte';

    let {
        min = 1,
        max = 100,
        maxAllowed = max,
        value = $bindable(min),
        breakPoints = [],
        autoBreakpoints = true,
        breakpointCount = 7,
        snapToBreakpoints = true,
        snapThreshold = 3,
        disabled = false,
        id = ID.unique(),
        onchange
    }: {
        min?: number;
        max?: number;
        maxAllowed?: number;
        value?: number;
        breakPoints?: number[];
        autoBreakpoints?: boolean;
        breakpointCount?: number;
        snapToBreakpoints?: boolean;
        snapThreshold?: number;
        disabled?: boolean;
        id?: string;
        onchange?: (value: number) => void;
    } = $props();

    let isDragging = $state(false);
    let trackRef = $state<HTMLDivElement>();

    const range = $derived(max - min);
    const clampedValue = $derived(Math.min(Math.max(value, min), maxAllowed));
    const relativeValue = $derived(clampedValue - min);
    const percentage = $derived((relativeValue / max) * 100);
    const maxAllowedPercentage = $derived(((maxAllowed - min) / range) * 100);

    const calculatedBreakpoints = $derived(() => {
        if (!autoBreakpoints) return breakPoints;

        const points = [];
        if (breakpointCount === 1) {
            points.push(min);
        } else {
            points.push(min);

            if (breakpointCount > 2) {
                const step = range / (breakpointCount - 1);
                for (let i = 1; i < breakpointCount - 1; i++) {
                    const rawValue = min + i * step;

                    let roundedValue: number;
                    if (range <= 10) {
                        roundedValue = Math.round(rawValue);
                    } else if (range <= 100) {
                        roundedValue = Math.round(rawValue / 5) * 5;
                    } else if (range <= 1000) {
                        roundedValue = Math.round(rawValue / 10) * 10;
                    } else {
                        roundedValue = Math.round(rawValue / 25) * 25;
                    }

                    points.push(Math.max(min + 1, Math.min(max - 1, roundedValue)));
                }
            }

            points.push(max);
        }

        return points;
    });

    const exactBreakpoints = $derived(() => {
        if (!autoBreakpoints) return breakPoints;

        return calculatedBreakpoints();
    });

    const debouncedOnChange = debounce((newValue: number) => {
        onchange?.(Math.round(newValue));
    }, 150);

    function findClosestBreakpoint(value: number): number | null {
        if (!snapToBreakpoints || calculatedBreakpoints().length === 0) return null;

        let closest = null;
        let closestDistance = Infinity;

        for (const breakpoint of calculatedBreakpoints()) {
            const distance = Math.abs(value - breakpoint);
            const distancePercentage = (distance / range) * 100;

            if (distancePercentage <= snapThreshold && distance < closestDistance) {
                closest = breakpoint;
                closestDistance = distance;
            }
        }

        return closest;
    }

    function handleMouseDown(event: MouseEvent) {
        if (disabled) return;

        isDragging = true;
        updateValue(event);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        event.preventDefault();
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        updateValue(event);
    }

    function handleMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    function handleTrackClick(event: MouseEvent) {
        if (disabled || isDragging) return;

        updateValue(event);
    }

    function updateValue(event: MouseEvent) {
        if (!trackRef) return;

        const rect = trackRef.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const newPercentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
        let newValue = min + (newPercentage / 100) * (max - min);

        const snapPoint = findClosestBreakpoint(newValue);
        if (snapPoint !== null) {
            newValue = snapPoint;
        }

        const clampedNewValue = Math.max(min, Math.min(newValue, maxAllowed));
        const roundedValue = Math.round(clampedNewValue);

        if (roundedValue !== value) {
            value = roundedValue;
            debouncedOnChange(value);
        }
    }

    onDestroy(() => {
        if (isDragging) {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    });
</script>

<div class="seekbar">
    <div class="track" role="presentation" bind:this={trackRef} onclick={handleTrackClick}>
        {#if maxAllowed < max}
            <div
                class="disabled-area"
                style:left="{maxAllowedPercentage}%"
                style:width="{100 - maxAllowedPercentage}%">
            </div>
        {/if}

        <div class="progress" style:--progress-width="{percentage}%"></div>

        <div class="thumb-container" style:left="{percentage}%">
            <div class="badge">
                <Badge variant="secondary" size="xs" content={Math.ceil(clampedValue).toString()} />
            </div>
            <div
                {id}
                role="slider"
                class="thumb"
                tabindex={disabled ? -1 : 0}
                aria-valuemin="0"
                aria-valuemax={maxAllowed}
                aria-valuenow={Math.ceil(clampedValue)}
                onmousedown={handleMouseDown}
                onmouseenter={() => !disabled}
                onmouseleave={() => !isDragging}>
            </div>
        </div>
    </div>

    {#if exactBreakpoints().length > 0}
        <div class="breakpoints">
            {#each exactBreakpoints() as breakPoint, index (index)}
                {@const breakPercentage = ((breakPoint - min) / range) * 100}
                <div
                    class="breakpoint"
                    class:is-major={index === 0 ||
                        index === exactBreakpoints().length - 1 ||
                        index === Math.floor(exactBreakpoints().length / 2)}
                    style:left="{breakPercentage}%">
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
    :root {
        --seekbar-height: 4px;
        --seekbar-thumb-size: 16px;
        --seekbar-thumb-radius: 50%;
        --seekbar-track-radius: 13px;

        --seekbar-breakpoint-height-small: 6px;
        --seekbar-breakpoint-height-medium: 6px;
        --seekbar-breakpoint-height-major: 12px;

        --seekbar-thumb-color: var(--bgcolor-neutral-primary);
        --seekbar-track-color: var(--bgcolor-neutral-tertiary);
        --seekbar-progress-color: var(--bgcolor-neutral-invert);
        --seekbar-thumb-border-color: var(--fgcolor-accent-neutral);
        --seekbar-breakpoint-color: var(--bgcolor-neutral-invert-weaker);

        // experimental, disabled seekbar progress color
        --seekbar-disabled-area-color: var(--overlay-neutral-pressed);
    }

    .seekbar {
        width: 100%;
        position: relative;
        padding: 1.25rem 0 0.75rem 0;
    }

    .breakpoints {
        position: absolute;
        top: calc(1.25rem + var(--seekbar-height) + 8px);
        left: 0;
        right: 0;
        height: 12px;
        pointer-events: none;
    }

    .breakpoint {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        width: 1px;
        height: var(--seekbar-breakpoint-height-small);
        background-color: var(--seekbar-breakpoint-color);

        &.is-major {
            height: var(--seekbar-breakpoint-height-major);
        }
    }

    .track {
        position: relative;
        height: var(--seekbar-height);
        background-color: var(--seekbar-track-color);
        border-radius: var(--seekbar-track-radius);
        cursor: pointer;
    }

    .disabled-area {
        top: 0;
        height: 100%;
        position: absolute;
        border-top-right-radius: var(--seekbar-track-radius);
        border-bottom-right-radius: var(--seekbar-track-radius);
        background-color: var(--seekbar-disabled-area-color);
    }

    .progress {
        top: 0;
        left: 0;
        height: 100%;
        position: absolute;
        width: var(--progress-width);
        background-color: var(--seekbar-progress-color);
        border-radius: var(--seekbar-track-radius);
    }

    .thumb-container {
        top: 50%;
        position: absolute;
        transform: translateX(-50%) translateY(-50%);
    }

    .badge {
        left: 50%;
        position: absolute;
        bottom: calc(100% + 8px);
        transform: translateX(-50%);

        :global(.badge) {
            color: var(--fgcolor-on-invert) !important;
            background: var(--bgcolor-neutral-invert) !important;
        }
    }

    .thumb {
        width: var(--seekbar-thumb-size);
        height: var(--seekbar-thumb-size);
        border-radius: var(--seekbar-thumb-radius);
        background-color: var(--seekbar-thumb-color);
        border: 1px solid var(--seekbar-thumb-border-color);
        cursor: grab;
    }
</style>
