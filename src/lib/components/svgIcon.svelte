<script lang="ts">
    import { iconPath } from '$lib/stores/app';

    export let name: string;
    export let type: 'color' | 'grayscale' = 'color';
    export let size = 40;
    let className = '';
    export { className as class };
</script>

<img class={className} width={size} height={size} src={$iconPath(name, type)} alt={name} />
