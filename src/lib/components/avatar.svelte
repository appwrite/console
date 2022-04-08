<script lang="ts">
    export let size: string;
    export let src: string;
</script>

<img width={size} height={size} class="avatar" style="--size: {size}px" {src} alt="" />
