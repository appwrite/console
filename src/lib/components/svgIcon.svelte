<script lang="ts">
    import { iconPath } from '$lib/stores/app';

    export let name: string;
    export let type: 'color' | 'grayscale' = 'color';
    export let size = 40;
    export let iconSize: keyof typeof iconSizes = 'medium';
    let className = '';
    export { className as class };

    enum iconSizes {
        xs = '--icon-size-xs',
        small = '--icon-size-s',
        medium = '--icon-size-m',
        large = '--icon-size-l',
        xlarge = '--icon-size-xl'
    }
</script>

<img
    class={className}
    width={size}
    height={size}
    style:inline-size={`var(${iconSizes[iconSize]})`}
    src={$iconPath(name, type)}
    alt={name} />
