<script lang="ts">
    import { uploader } from '$lib/stores/uploader';
    import { Upload } from '@appwrite.io/pink-svelte';
</script>

{#if $uploader?.isOpen}
    <Upload.Box bind:files={$uploader.files} on:close={() => uploader.close()}></Upload.Box>
{/if}
