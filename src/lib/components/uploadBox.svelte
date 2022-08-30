<script lang="ts">
    import { uploader } from '$lib/stores/uploader';
    import { Pill } from '$lib/elements';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Avatar } from '$lib/components';
    import { files } from '../../routes/console/[project]/storage/bucket/[bucket]/store';
    import { addNotification } from '$lib/stores/notifications';

    async function removeFile($id: string, bucketId: string) {
        try {
            const file = await sdkForProject.storage.getFile(bucketId, $id);
            uploader.removeFile(file);
            await sdkForProject.storage.deleteFile(bucketId, $id);
            files.removeFile(file.$id);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    const getPreview = (fileId: string, bucketId: string) =>
        sdkForProject.storage.getFilePreview(bucketId, fileId, 32, 32).toString() + '&mode=admin';
</script>

{#if $uploader?.isOpen}
    <section class="upload-box is-float">
        <header class="upload-box-header">
            <h4 class="upload-box-title">
                <span class="text">Uploading files</span>
                <span class="amount">{$uploader.files.length}</span>
            </h4>
            <button
                class="icon-button"
                class:is-open={!$uploader.isCollapsed}
                aria-label="toggle upload box"
                on:click={() => uploader.toggle()}>
                <span class="icon-cheveron-up" aria-hidden="true" />
            </button>
            <button
                on:click={() => uploader.close()}
                class="icon-button"
                aria-label="close upload box">
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>
        <div class="upload-box-content" class:is-open={!$uploader.isCollapsed}>
            <ul class="upload-box-list">
                {#each $uploader.files as file}
                    {@const progress = Math.round(file.progress)}
                    {#if file.completed || file.progress === 100}
                        <li class="upload-box-item">
                            <div class="u-margin-inline-end-16">
                                <Avatar
                                    size={32}
                                    src={getPreview(file.$id, file.bucketId)}
                                    name={file.name} />
                            </div>

                            <label for={file.name} class="file-name u-trim">{file.name}</label>
                            <span class="icon-check" />
                        </li>
                    {:else if file.failed}
                        <li class="upload-box-item">
                            <div class="upload-image u-margin-inline-end-16">
                                <div
                                    class="progress"
                                    role="progressbar"
                                    aria-valuenow={progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100} />
                                <span class="icon">{progress}%</span>
                            </div>
                            <label for={file.name} class="file-name u-trim">{file.name}</label>
                            <Pill danger>Failed</Pill>
                            <button
                                class="icon-button"
                                aria-label="Failed"
                                on:click={() => {
                                    removeFile(file.$id, file.bucketId);
                                }}>
                                <span class="icon-x" />
                            </button>
                        </li>
                    {:else}
                        <li class="upload-box-item">
                            <div class="upload-image u-margin-inline-end-16">
                                <div
                                    class="progress"
                                    role="progressbar"
                                    style={`--progress-value:${progress}`}
                                    aria-valuenow={progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100} />
                                <span class="icon">{progress}%</span>
                            </div>
                            <label for={file.name} class="file-name u-trim">{file.name}</label>
                            <Pill warning>Pending</Pill>
                            <button
                                class="button button is-only-icon is-text icon-button"
                                aria-label="Pending"
                                disabled={!file.$id || file.$id === 'tmp'}
                                on:click={() => removeFile(file.$id, file.bucketId)}>
                                <span class="icon-x" />
                            </button>
                        </li>
                    {/if}
                {/each}
            </ul>
        </div>
    </section>
{/if}
