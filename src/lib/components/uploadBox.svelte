<script lang="ts">
    import { uploader } from '$lib/stores/uploader';
    import { Upload } from '@appwrite.io/pink-svelte';
</script>

{#if $uploader?.isOpen}
    <div class="upload-box-wrapper">
        <Upload.Box
            files={$uploader.files.map((file) => {
                return {
                    name: file.name,
                    size: file.size,
                    status: file.status
                };
            })}
            on:close={() => uploader.close()} />
    </div>
{/if}

<style lang="scss">
    .upload-box-wrapper {
        min-width: 400px;
        max-width: 100vw;

        & :global(.upload-box) {
            width: 100%;
        }
    }
</style>
