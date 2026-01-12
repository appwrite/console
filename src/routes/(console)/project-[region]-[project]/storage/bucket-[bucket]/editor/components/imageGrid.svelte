<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { ImageFormat, type Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { Avatar, Badge } from '@appwrite.io/pink-svelte';
    import type { TransformationState } from '$lib/helpers/imageTransformations';

    let {
        files,
        selectedFile = $bindable(null),
        transformationState,
        appliedPresets
    }: {
        files: Models.File[];
        selectedFile?: Models.File | null;
        transformationState: TransformationState;
        appliedPresets: Record<string, string>; // fileId -> presetId
    } = $props();

    function getPreview(fileId: string, transformations?: TransformationState) {
        const params: any = {
            bucketId: page.params.bucket,
            fileId,
            width: transformations?.width || 200,
            height: transformations?.height || 200,
            output: ImageFormat.Avif
        };

        if (transformations?.gravity) params.gravity = transformations.gravity;
        if (transformations?.borderWidth) params.borderWidth = transformations.borderWidth;
        if (transformations?.borderColor) params.borderColor = transformations.borderColor.replace('#', '');
        if (transformations?.borderRadius) params.borderRadius = transformations.borderRadius;
        if (transformations?.background) params.background = transformations.background.replace('#', '');
        if (transformations?.quality) params.quality = transformations.quality;

        return sdk
            .forProject(page.params.region, page.params.project)
            .storage.getFilePreview(params)
            .toString() + '&mode=admin';
    }

    function selectFile(file: Models.File) {
        selectedFile = file;
    }

    function isImageFile(file: Models.File): boolean {
        return file.mimeType?.startsWith('image/') ?? false;
    }

    const imageFiles = $derived(files.filter(isImageFile));
</script>

{#if imageFiles.length === 0}
    <div class="empty-state">
        <p>No images found in this bucket</p>
    </div>
{:else}
    <Layout.Grid columns={4} columnsXS={2} columnsS={3} gap="m">
        {#each imageFiles as file (file.$id)}
            {@const previewUrl = getPreview(file.$id, appliedPresets[file.$id] ? transformationState : undefined)}
            {@const isSelected = selectedFile?.$id === file.$id}
            <div
                class="grid-item"
                class:selected={isSelected}
                role="button"
                tabindex="0"
                onclick={() => selectFile(file)}
                onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectFile(file);
                    }
                }}>
                <div class="image-wrapper">
                    <Avatar size="xl" src={previewUrl} alt={file.name} />
                    {#if appliedPresets[file.$id]}
                        <Badge size="xs" variant="secondary" content="Preset" class="preset-badge" />
                    {/if}
                </div>
                <div class="file-name">{file.name}</div>
            </div>
        {/each}
    </Layout.Grid>
{/if}

<style>
    .empty-state {
        padding: 4rem 2rem;
        text-align: center;
        color: var(--color-neutral-70);
    }

    .grid-item {
        cursor: pointer;
        padding: 0.5rem;
        border-radius: var(--border-radius-small);
        border: 2px solid transparent;
        transition: all 0.2s;
        background: var(--color-neutral-0);
    }

    .grid-item:hover {
        border-color: var(--color-neutral-30);
        background: var(--color-neutral-5);
    }

    .grid-item.selected {
        border-color: var(--color-primary-100);
        background: var(--color-primary-5);
    }

    .image-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        margin-bottom: 0.5rem;
        border-radius: var(--border-radius-small);
        overflow: hidden;
        background: var(--color-neutral-10);
    }

    .preset-badge {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }

    .file-name {
        font-size: var(--font-size-0);
        color: var(--color-neutral-100);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>

