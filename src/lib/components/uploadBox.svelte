<script lang="ts">
    import { uploader } from '$lib/stores/uploader';
    import { Pill } from '$lib/elements';
    import { sdk } from '$lib/stores/sdk';
    import { Avatar } from '$lib/components';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    let hovering = false;

    function getPreview(fileId: string, bucketId: string) {
        return (
            sdk
                .forProject($page.params.region, $page.params.project)
                .storage.getFilePreview(bucketId, fileId, 32, 32)
                .toString() + '&mode=admin'
        );
    }
</script>

{#if $uploader?.isOpen}
    <section class="upload-box">
        <header class="upload-box-header">
            <h4 class="upload-box-title">
                <span class="text">Uploading files</span>
                <span class="amount">{$uploader.files.length}</span>
            </h4>
            <button
                class="upload-box-button"
                class:is-open={!$uploader.isCollapsed}
                aria-label="toggle upload box"
                on:click={() => uploader.toggle()}>
                <span class="icon-cheveron-up" aria-hidden="true" />
            </button>
            <button
                on:click={() => uploader.reset()}
                class="upload-box-button"
                aria-label="close upload box">
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>
        <div class="upload-box-content" class:is-open={!$uploader.isCollapsed}>
            <ul class="upload-box-list">
                {#each $uploader.files as file}
                    {@const progress = Math.round(file.progress)}

                    {#if file.completed || file.progress === 100}
                        <a
                            class="upload-box-item"
                            href={`${base}/project-${$page.params.region}-${$page.params.project}/storage/bucket-${$page.params.bucket}/file-${file.$id}`}>
                            <div class="u-margin-inline-end-16">
                                <Avatar
                                    size={32}
                                    src={getPreview(file.$id, file.bucketId)}
                                    name={file.name} />
                            </div>

                            <label for={file.name} class="file-name u-trim">{file.name}</label>

                            <button
                                class="upload-box-button"
                                aria-label="Failed"
                                on:mouseenter={() => (hovering = true)}
                                on:mouseleave={() => (hovering = false)}
                                on:click|preventDefault={() => uploader.removeFromQueue(file.$id)}>
                                <span class:icon-check={!hovering} class:icon-x={hovering} />
                            </button>
                        </a>
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
                                class="upload-box-button"
                                aria-label="Failed"
                                on:click|preventDefault={() => uploader.removeFromQueue(file.$id)}>
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
                        </li>
                    {/if}
                {/each}
            </ul>
        </div>
    </section>
{/if}

<style>
    .upload-box-title {
        font-size: 11px;
    }

    .upload-box-button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .upload-box-content {
        min-width: 400px;
        max-width: 100vw;
    }

    .file-name {
        max-width: 24ch;
    }
</style>
