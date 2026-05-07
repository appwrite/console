<script lang="ts">
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import {
        getUploadGroupKey,
        uploader,
        type UploadGroupKey,
        type UploaderFile
    } from '$lib/stores/uploader';
    import { Typography } from '@appwrite.io/pink-svelte';

    type UploadBoxGroup = {
        key: UploadGroupKey;
        title: string;
        files: UploaderFile[];
        isOpen: boolean;
    };

    const groupTitles: Record<UploadGroupKey, string> = {
        storage: 'File Uploads',
        deployments: 'Deployment Uploads'
    };

    const groups = $derived.by<UploadBoxGroup[]>(() => {
        return (Object.keys(groupTitles) as UploadGroupKey[])
            .map((groupKey) => {
                const files = $uploader.files.filter(
                    (file) => getUploadGroupKey(file.kind) === groupKey
                );

                return {
                    key: groupKey,
                    title: groupTitles[groupKey],
                    files,
                    isOpen: $uploader.groups[groupKey].isOpen
                };
            })
            .filter((group) => group.files.length && $uploader.groups[group.key].isVisible);
    });

    function statusIcon(status: UploaderFile['status']) {
        if (status === 'success') return 'icon-check';
        if (status === 'failed') return 'icon-warning';
        return 'icon-clock';
    }

    function statusClass(status: UploaderFile['status']) {
        if (status === 'success') return 'is-success';
        if (status === 'failed') return 'is-danger';
        return '';
    }
</script>

{#if $uploader.isOpen}
    <div class="box-holder u-flex u-flex-vertical u-gap-16" style="align-items: end">
        {#each groups as group (group.key)}
            <section class="upload-box">
                <header class="upload-box-header">
                    <h4 class="upload-box-title">
                        <Typography.Text variant="m-500">
                            {group.title} ({group.files.length})
                        </Typography.Text>
                    </h4>
                    <button
                        class="upload-box-button"
                        class:is-open={group.isOpen}
                        aria-label={`toggle ${group.title.toLowerCase()}`}
                        onclick={() => uploader.toggleGroup(group.key)}>
                        <span class="icon-cheveron-up" aria-hidden="true"></span>
                    </button>
                    <button
                        class="upload-box-button"
                        aria-label={`close ${group.title.toLowerCase()}`}
                        onclick={() => uploader.hideGroup(group.key)}>
                        <span class="icon-x" aria-hidden="true"></span>
                    </button>
                </header>

                <div class="upload-box-content" class:is-open={group.isOpen}>
                    <ul class="upload-box-list">
                        {#each group.files as file (file.clientId)}
                            {@const readableSize = humanFileSize(file.size)}
                            <li class="upload-box-item">
                                <span class="icon-document" aria-hidden="true"></span>
                                <div class="file-name">
                                    <Typography.Text>{file.name}</Typography.Text>
                                    <Typography.Caption variant="400">
                                        {readableSize.value + readableSize.unit}
                                    </Typography.Caption>
                                </div>
                                <span
                                    class={`upload-box-button ${statusClass(file.status)}`}
                                    aria-hidden="true">
                                    <span class={statusIcon(file.status)}></span>
                                </span>
                            </li>
                        {/each}
                    </ul>
                </div>
            </section>
        {/each}
    </div>
{/if}

<style lang="scss">
    .upload-box-title {
        font-size: 11px;
    }

    .upload-box-content {
        min-width: 320px;
        max-width: min(420px, calc(100vw - 2rem));
    }

    .upload-box-button {
        display: flex;
        align-items: center;
        justify-content: center;

        &.is-danger {
            color: var(--fgcolor-error);
        }

        &.is-success {
            color: var(--fgcolor-success);
        }
    }

    .upload-box-item {
        align-items: center;
    }

    .file-name {
        display: flex;
        min-width: 0;
        flex: 1;
        flex-direction: column;
        gap: 0.25rem;
    }
</style>
