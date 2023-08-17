<script lang="ts">
    import { iconPath } from '$lib/stores/app';

    export let name: string;
    export let type: 'color' | 'grayscale' = 'color';
    let className = '';
    export { className as class };
</script>

<img class={className} src={$iconPath(name, type)} alt={name} />
