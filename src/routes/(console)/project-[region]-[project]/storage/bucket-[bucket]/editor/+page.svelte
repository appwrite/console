<script lang="ts">
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { ImageFormat, Query, type Models } from '@appwrite.io/console';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import { CopyInput } from '$lib/components';
    import ImageGrid from './components/imageGrid.svelte';
    import TransformationPanel from './components/transformationPanel.svelte';
    import CodePanel from './components/codePanel.svelte';
    import { getPresets, savePreset, createPreset, type Preset } from './components/presetManager';
    import {
        generateTransformationParams,
        type TransformationState
    } from '$lib/helpers/imageTransformations';

    // UI State
    let activeTab = $state<'design' | 'code'>('design');
    let bucketFiles = $state<Models.File[]>([]);
    let selectedFile = $state<Models.File | null>(null);
    let loading = $state(true);
    let zoom = $state(100);

    // Transformation state
    let transformationState = $state<
        TransformationState & {
            aspectRatioLocked?: boolean;
            originalAspectRatio?: number;
            crop?: string;
        }
    >({
        width: 700,
        height: 438,
        aspectRatioLocked: true,
        originalAspectRatio: 700 / 438,
        gravity: 'center',
        borderWidth: 0,
        borderColor: '000000',
        borderOpacity: 100,
        borderRadius: 0,
        background: '',
        quality: 100,
        output: ImageFormat.Jpg,
        rotation: 0,
        crop: 'none'
    });

    // Presets
    let presets = $state<Preset[]>([]);
    let selectedPresetId = $state<string | null>(null);
    let appliedPresets = $state<Record<string, string>>({}); // fileId -> presetId

    // Canvas state
    let canvasContainer = $state<HTMLDivElement>();
    let imageElement = $state<HTMLImageElement>();
    let isResizing = $state(false);
    let resizeHandle = $state<string | null>(null);
    let startX = $state(0);
    let startY = $state(0);
    let startWidth = $state(0);
    let startHeight = $state(0);
    let focalPointOverlay = $state<string | null>(null);

    onMount(async () => {
        try {
            const response = await sdk
                .forProject(page.params.region, page.params.project)
                .storage.listFiles({
                    bucketId: page.params.bucket,
                    queries: [Query.limit(100), Query.orderDesc('$createdAt')]
                });
            bucketFiles = response.files.filter((f) => f.mimeType?.startsWith('image/'));
            if (bucketFiles.length > 0 && !selectedFile) {
                selectedFile = bucketFiles[0];
                // Load original image dimensions
                loadImageDimensions();
            }
            presets = getPresets(page.params.bucket);
        } catch (error) {
            console.error('Failed to load bucket files:', error);
        } finally {
            loading = false;
        }
    });

    function loadImageDimensions() {
        if (!selectedFile) return;
        const img = new Image();
        img.onload = () => {
            transformationState.width = img.width;
            transformationState.height = img.height;
            transformationState.originalAspectRatio = img.width / img.height;
            transformationState.aspectRatioLocked = true;
        };
        // Load original image without transformations to get original dimensions
        img.src =
            sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFilePreview({
                    bucketId: selectedFile.bucketId,
                    fileId: selectedFile.$id
                })
                .toString() + '&mode=admin';
    }

    function getPreviewUrl(): string {
        if (!selectedFile) return '';
        const params = generateTransformationParams(transformationState);
        const previewParams: any = {
            bucketId: selectedFile.bucketId,
            fileId: selectedFile.$id,
            ...params
        };
        return (
            sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFilePreview(previewParams)
                .toString() + '&mode=admin'
        );
    }

    let previewUrl = $derived(getPreviewUrl());

    // Watch for file selection changes and apply presets
    let lastSelectedFileId = $state<string | null>(null);
    $effect(() => {
        if (selectedFile && selectedFile.$id !== lastSelectedFileId) {
            lastSelectedFileId = selectedFile.$id;
            // Reset transformations or apply preset if one is selected for this file
            if (appliedPresets[selectedFile.$id]) {
                const preset = presets.find((p) => p.id === appliedPresets[selectedFile.$id]);
                if (preset) {
                    transformationState = { ...preset.transformations };
                }
            } else {
                // Reset to original dimensions
                loadImageDimensions();
            }
        }
    });

    function handleFocalPointClick(event: MouseEvent) {
        if (!canvasContainer || !selectedFile || isResizing) return;
        const rect = canvasContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;

        // Determine focal point based on position
        const thirdX = width / 3;
        const thirdY = height / 3;

        let point = 'center';
        if (x < thirdX && y < thirdY) point = 'top-left';
        else if (x < thirdX && y > thirdY * 2) point = 'bottom-left';
        else if (x > thirdX * 2 && y < thirdY) point = 'top-right';
        else if (x > thirdX * 2 && y > thirdY * 2) point = 'bottom-right';
        else if (x < thirdX) point = 'left';
        else if (x > thirdX * 2) point = 'right';
        else if (y < thirdY) point = 'top';
        else if (y > thirdY * 2) point = 'bottom';

        transformationState.gravity = point;
        focalPointOverlay = point;
        setTimeout(() => (focalPointOverlay = null), 1000);
    }

    function handleResizeStart(event: MouseEvent, handle: string) {
        event.stopPropagation();
        isResizing = true;
        resizeHandle = handle;
        startX = event.clientX;
        startY = event.clientY;
        startWidth = transformationState.width || 0;
        startHeight = transformationState.height || 0;
    }

    function handleMouseMove(event: MouseEvent) {
        if (!isResizing || !resizeHandle) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        const scale = zoom / 100;

        let newWidth = startWidth;
        let newHeight = startHeight;

        if (resizeHandle.includes('e')) {
            newWidth = Math.max(1, startWidth + dx / scale);
        }
        if (resizeHandle.includes('w')) {
            newWidth = Math.max(1, startWidth - dx / scale);
        }
        if (resizeHandle.includes('s')) {
            newHeight = Math.max(1, startHeight + dy / scale);
        }
        if (resizeHandle.includes('n')) {
            newHeight = Math.max(1, startHeight - dy / scale);
        }

        if (transformationState.aspectRatioLocked && transformationState.originalAspectRatio) {
            if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
                newHeight = Math.round(newWidth / transformationState.originalAspectRatio);
            } else {
                newWidth = Math.round(newHeight * transformationState.originalAspectRatio);
            }
        }

        transformationState.width = newWidth;
        transformationState.height = newHeight;
    }

    function handleMouseUp() {
        isResizing = false;
        resizeHandle = null;
    }

    function handlePresetSelected(presetId: string | null) {
        selectedPresetId = presetId;
        if (presetId && selectedFile) {
            const preset = presets.find((p) => p.id === presetId);
            if (preset) {
                transformationState = { ...preset.transformations };
                appliedPresets[selectedFile.$id] = presetId;
            }
        } else if (selectedFile) {
            delete appliedPresets[selectedFile.$id];
        }
    }

    function saveCurrentAsPreset() {
        const name = prompt('Enter preset name:');
        if (!name || !selectedFile) return;
        const preset = createPreset(name, transformationState);
        savePreset(page.params.bucket, preset);
        presets = getPresets(page.params.bucket);
        selectedPresetId = preset.id;
        appliedPresets[selectedFile.$id] = preset.id;
    }

    function getFocalPointLabel(): string {
        const point = transformationState.gravity || 'center';
        const labels: Record<string, string> = {
            'top-left': 'Top-Left',
            top: 'Top',
            'top-right': 'Top-Right',
            left: 'Left',
            center: 'Center',
            right: 'Right',
            'bottom-left': 'Bottom-Left',
            bottom: 'Bottom',
            'bottom-right': 'Bottom-Right'
        };
        return labels[point] || 'Center';
    }

    function getFocalPointPosition(): { top: string; left: string; width: string; height: string } {
        const point = transformationState.gravity || 'center';
        const positions: Record<
            string,
            { top: string; left: string; width: string; height: string }
        > = {
            'top-left': { top: '0%', left: '0%', width: '33.33%', height: '33.33%' },
            top: { top: '0%', left: '33.33%', width: '33.33%', height: '33.33%' },
            'top-right': { top: '0%', left: '66.66%', width: '33.33%', height: '33.33%' },
            left: { top: '33.33%', left: '0%', width: '33.33%', height: '33.33%' },
            center: { top: '33.33%', left: '33.33%', width: '33.33%', height: '33.33%' },
            right: { top: '33.33%', left: '66.66%', width: '33.33%', height: '33.33%' },
            'bottom-left': { top: '66.66%', left: '0%', width: '33.33%', height: '33.33%' },
            bottom: { top: '66.66%', left: '33.33%', width: '33.33%', height: '33.33%' },
            'bottom-right': { top: '66.66%', left: '66.66%', width: '33.33%', height: '33.33%' }
        };
        return positions[point] || positions.center;
    }
</script>

<Container>
    {#if loading}
        <Layout.Stack gap="l">
            <Typography.Text>Loading editor...</Typography.Text>
        </Layout.Stack>
    {:else if bucketFiles.length === 0}
        <Layout.Stack gap="l">
            <div class="empty-state">
                <Typography.Title>Image Editor</Typography.Title>
                <Typography.Text>No images found in this bucket.</Typography.Text>
            </div>
        </Layout.Stack>
    {:else if !selectedFile}
        <!-- Grid View -->
        <Layout.Stack gap="l">
            <Typography.Title size="m">Select an image to edit</Typography.Title>
            <ImageGrid
                files={bucketFiles}
                bind:selectedFile
                {transformationState}
                {appliedPresets} />
        </Layout.Stack>
    {:else}
        <!-- Editor View -->
        <Layout.Stack gap="l">
            <!-- URL Input -->
            <div class="url-section">
                <CopyInput label="" value={previewUrl} />
            </div>

            <!-- Main Editor Layout -->
            <div class="editor-layout">
                <!-- Left Panel - Canvas -->
                <div class="preview-section">
                    <!-- Focal Point Label -->
                    <div class="focal-point-section">
                        <Typography.Text class="focal-point-label">
                            Focal point: {getFocalPointLabel()}
                        </Typography.Text>
                    </div>

                    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
                    <div
                        class="preview-container"
                        bind:this={canvasContainer}
                        role="button"
                        tabindex="-1"
                        onclick={handleFocalPointClick}
                        onkeydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleFocalPointClick(e as any);
                            }
                        }}
                        onmousemove={handleMouseMove}
                        onmouseup={handleMouseUp}
                        onmouseleave={handleMouseUp}
                        style="cursor: crosshair;">
                        <div class="preview-wrapper" style="transform: scale({zoom / 100});">
                            <img
                                bind:this={imageElement}
                                src={previewUrl}
                                alt={selectedFile.name}
                                class="preview-image"
                                draggable="false" />
                            <!-- Grid overlay (rule of thirds) -->
                            <div class="grid-overlay">
                                <div class="grid-line grid-line-v" style="left: 33.33%;"></div>
                                <div class="grid-line grid-line-v" style="left: 66.66%;"></div>
                                <div class="grid-line grid-line-h" style="top: 33.33%;"></div>
                                <div class="grid-line grid-line-h" style="top: 66.66%;"></div>
                            </div>
                            <!-- Focal point overlay -->
                            {#if focalPointOverlay || transformationState.gravity}
                                {@const pos = getFocalPointPosition()}
                                <div
                                    class="focal-overlay"
                                    style="top: {pos.top}; left: {pos.left}; width: {pos.width}; height: {pos.height};">
                                </div>
                            {/if}
                            <!-- Resize handles -->
                            <div class="resize-handles">
                                <button
                                    type="button"
                                    class="handle handle-nw"
                                    onmousedown={(e) => handleResizeStart(e, 'nw')}
                                    aria-label="Resize from top-left"
                                    style="cursor: nwse-resize;"></button>
                                <button
                                    type="button"
                                    class="handle handle-ne"
                                    onmousedown={(e) => handleResizeStart(e, 'ne')}
                                    aria-label="Resize from top-right"
                                    style="cursor: nesw-resize;"></button>
                                <button
                                    type="button"
                                    class="handle handle-sw"
                                    onmousedown={(e) => handleResizeStart(e, 'sw')}
                                    aria-label="Resize from bottom-left"
                                    style="cursor: nesw-resize;"></button>
                                <button
                                    type="button"
                                    class="handle handle-se"
                                    onmousedown={(e) => handleResizeStart(e, 'se')}
                                    aria-label="Resize from bottom-right"
                                    style="cursor: nwse-resize;"></button>
                            </div>
                        </div>
                        <Typography.Text variant="m-400" class="dimensions-text">
                            {transformationState.width || 0} × {transformationState.height || 0}
                        </Typography.Text>

                        <!-- Rotation slider -->
                        <div class="rotation-slider">
                            <input
                                type="range"
                                min="0"
                                max="360"
                                bind:value={transformationState.rotation}
                                class="slider" />
                            <Typography.Text class="rotation-text"
                                >{transformationState.rotation || 0}°</Typography.Text>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Controls -->
                <div class="controls-section">
                    <TransformationPanel
                        bind:activeTab
                        files={bucketFiles}
                        bind:selectedFile
                        bind:transformationState
                        {presets}
                        bind:selectedPresetId
                        bind:zoom
                        on:presetSelected={(e) => handlePresetSelected(e.detail)} />

                    {#if activeTab === 'code' && selectedFile}
                        <div class="code-panel-wrapper">
                            <CodePanel
                                {transformationState}
                                bucketId={selectedFile.bucketId}
                                fileId={selectedFile.$id} />
                        </div>
                    {/if}

                    <!-- Save as Preset Button -->
                    <div class="preset-actions">
                        <button class="save-preset-btn" onclick={saveCurrentAsPreset}>
                            Save as preset
                        </button>
                    </div>
                </div>
            </div>
        </Layout.Stack>
    {/if}
</Container>

<style>
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem;
        text-align: center;
    }

    .url-section {
        width: 100%;
    }

    .editor-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        min-height: 600px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-medium);
        overflow: hidden;
    }

    .preview-section {
        background: var(--color-neutral-5);
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .focal-point-section {
        position: absolute;
        top: 1rem;
        left: 1rem;
        z-index: 10;
        background: rgba(255, 255, 255, 0.9);
        padding: 0.5rem 0.75rem;
        border-radius: var(--border-radius-small);
        pointer-events: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .preview-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 2rem;
        overflow: auto;
    }

    .preview-wrapper {
        position: relative;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform-origin: center;
    }

    .preview-image {
        display: block;
        max-width: 100%;
        max-height: 70vh;
        border-radius: var(--border-radius-small);
        user-select: none;
    }

    .grid-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    .grid-line {
        position: absolute;
        background: rgba(255, 255, 255, 0.3);
    }

    .grid-line-v {
        top: 0;
        bottom: 0;
        width: 1px;
    }

    .grid-line-h {
        left: 0;
        right: 0;
        height: 1px;
    }

    .focal-overlay {
        position: absolute;
        background: rgba(59, 130, 246, 0.3);
        border: 2px solid rgba(59, 130, 246, 0.6);
        pointer-events: none;
        transition: all 0.2s;
    }

    .resize-handles {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    .handle {
        position: absolute;
        width: 12px;
        height: 12px;
        background: var(--color-primary-100);
        border: 2px solid white;
        border-radius: 50%;
        pointer-events: all;
        z-index: 10;
    }

    .handle-nw {
        top: -6px;
        left: -6px;
    }

    .handle-ne {
        top: -6px;
        right: -6px;
    }

    .handle-sw {
        bottom: -6px;
        left: -6px;
    }

    .handle-se {
        bottom: -6px;
        right: -6px;
    }

    /* svelte-ignore css_unused_selector */
    .dimensions-text {
        margin-top: 1rem;
        background: var(--color-neutral-0);
        padding: 0.5rem 0.75rem;
        border-radius: var(--border-radius-small);
        border: 1px solid var(--color-border);
    }

    .rotation-slider {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        max-width: 300px;
    }

    .slider {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: var(--color-neutral-20);
        outline: none;
        accent-color: var(--color-primary-100);
    }

    /* svelte-ignore css_unused_selector */
    .rotation-text {
        min-width: 40px;
        text-align: right;
        color: var(--color-neutral-70);
    }

    .handle {
        border: none;
        padding: 0;
    }

    .controls-section {
        display: flex;
        flex-direction: column;
        background: var(--color-neutral-0);
        border-left: 1px solid var(--color-border);
        height: 100%;
        overflow-y: auto;
    }

    .code-panel-wrapper {
        padding: 1rem;
        border-top: 1px solid var(--color-border);
        max-height: 400px;
        overflow-y: auto;
    }

    .preset-actions {
        padding: 1rem;
        border-top: 1px solid var(--color-border);
        margin-top: auto;
    }

    .save-preset-btn {
        width: 100%;
        padding: 0.75rem;
        background: var(--color-primary-100);
        color: white;
        border: none;
        border-radius: var(--border-radius-small);
        font-size: var(--font-size-0);
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .save-preset-btn:hover {
        background: var(--color-primary-110);
    }

    @media (max-width: 1024px) {
        .editor-layout {
            grid-template-columns: 1fr;
        }

        .controls-section {
            order: -1;
            border-left: none;
            border-bottom: 1px solid var(--color-border);
        }
    }
</style>
