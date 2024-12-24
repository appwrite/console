<script lang="ts">
    import { uploader } from '$lib/stores/uploader';
    import { Upload } from '@appwrite.io/pink-svelte';
</script>

{#if $uploader?.isOpen}
    <Upload.Box files={$uploader.files} on:close={() => uploader.close()} />
{/if}
