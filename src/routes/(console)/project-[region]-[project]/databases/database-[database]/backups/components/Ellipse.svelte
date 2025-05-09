<script lang="ts">
    export let size: 'm' | 's' = 'm';
    export let color: string | undefined = 'currentColor';

    const sizes = {
        m: { width: 8, height: 8, cx: 4, cy: 4, r: 4 },
        s: { width: 4, height: 4, cx: 2, cy: 2, r: 2 }
    };

    const { width, height, cx, cy, r } = sizes[size] || sizes.m;
</script>

<span class="ellipse" class:m={size === 'm'} class:s={size === 's'}>
    <span class="ellipse-wrapper">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            {width}
            {height}
            viewBox={`0 0 ${width} ${height}`}
            fill="none">
            <circle {cx} {cy} {r} fill={color ?? 'currentColor'} />
        </svg>
    </span>
</span>

<style>
    .ellipse {
        display: inline-flex;
        align-items: center;
    }

    .ellipse-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .ellipse svg {
        display: inline;
        vertical-align: middle;
    }
</style>
