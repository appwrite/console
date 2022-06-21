<script lang="ts">
    export let size: number;
    export let src: string;
    export let name: string;
</script>

<img
    width={size}
    height={size}
    class="avatar"
    style="--size: {size / 16}rem"
    {src}
    title={name}
    alt={name} />
