<script lang="ts">
    export let size: number;
    export let src: string;
    export let name: string;
    export let color: string = 'transparent';
</script>

<img
    width={size}
    height={size}
    class="avatar"
    style="--size: {size / 16}rem; background-color: {color};"
    {src}
    title={name}
    alt={name} />
