<script lang="ts">
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { ImageFormat, Query, type Models } from '@appwrite.io/console';
    import { Layout, Typography, Canvas } from '@appwrite.io/pink-svelte';
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
    import type { CanvasObjectUnion } from '@appwrite.io/pink-svelte/dist/canvas/index.js'; // Import type explicitly if needed or infer

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
    let focalPointOverlay = $state<string | null>(null);
    let canvasCore = $state<any>(null);
    let currentZoom = $state(1);

    let canvasObjects = $state<CanvasObjectUnion[]>([]);

    // Force selection of the main image and ensure handles are visible
    $effect(() => {
        if (canvasCore && selectedFile && canvasObjects.length > 0) {
            // Use a small timeout to ensure the canvas has initialized properly
            setTimeout(() => {
                canvasCore.selectObject('main-image');
            }, 0);
        }
    });

    $effect(() => {
        if (!canvasCore) return;
        const unsubscribe = canvasCore.zoom.subscribe((z: number) => {
            currentZoom = z;
            zoom = Math.round(z * 100);
        });
        return unsubscribe;
    });
    // Sync init
    $effect(() => {
        if (selectedFile) {
            const existing = canvasObjects.find((o) => o.id === 'main-image');
            if (!existing) {
                // Initialize
                canvasObjects = [
                    {
                        id: 'main-image',
                        type: 'image',
                        x: 0,
                        y: 0,
                        width: transformationState.width || 700,
                        height: transformationState.height || 438,
                        rotation: transformationState.rotation || 0,
                        src: previewUrl, // Use current preview URL
                        alt: selectedFile.name,
                        maintainAspectRatio: transformationState.aspectRatioLocked,
                        selected: true,
                        // Ensure optional props are set
                        cropX: 0,
                        cropY: 0
                    }
                ];
                // Center the view on init
                setTimeout(() => {
                    canvasCore?.panTo(0, 0);
                    canvasCore?.selectObject('main-image');
                }, 100);
            } else {
                // Only update if dimensions drastically mismatch initial load (prevent loops)
                // or if rotation changes from external source (like input)
                // But wait, if we bind, we should let Canvas update objects.
                // We should only push to objects if the user manually types in the inputs.
                // The issue is distinguishing input change vs drag change.
                // We can check document.activeElement?
            }
        }
    });

    // Update transformationState when canvasObjects change (drag/resize)
    $effect(() => {
        const obj = canvasObjects.find((o) => o.id === 'main-image');
        if (obj) {
            // Only update if not currently editing inputs?
            // Actually, the binding should handle it if we are consistent.
            transformationState.width = Math.round(obj.width);
            transformationState.height = Math.round(obj.height);
            if (obj.rotation !== undefined) transformationState.rotation = obj.rotation;
        }
    });

    // When transformationState changes (e.g. user input), update canvas object
    // We need to avoid loops.
    $effect(() => {
        const obj = canvasObjects.find((o) => o.id === 'main-image');
        if (obj) {
            if (obj.width !== transformationState.width) obj.width = transformationState.width;
            if (obj.height !== transformationState.height) obj.height = transformationState.height;
            if (obj.rotation !== transformationState.rotation)
                obj.rotation = transformationState.rotation;
            if (obj.maintainAspectRatio !== transformationState.aspectRatioLocked)
                obj.maintainAspectRatio = transformationState.aspectRatioLocked;
        }
    });

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

    function getPreviewUrl(forCanvas = false): string {
        if (!selectedFile) return '';
        const params = generateTransformationParams(transformationState);

        // For canvas preview, we want to omit width/height so the browser handles scaling
        // This prevents "zooming"/flashing artifacts during resize drag
        if (forCanvas) {
            delete params.width;
            delete params.height;
        }

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

    let previewUrl = $derived(getPreviewUrl(true)); // For canvas
    let downloadUrl = $derived(getPreviewUrl(false)); // For final output/code

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
        if (!selectedFile) return;

        const target = event.target as HTMLElement;
        if (target.closest('.resize-handle')) return;

        const objectEl = target.closest('.canvas-object');
        if (!objectEl) return;

        const rect = objectEl.getBoundingClientRect();
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
                <CopyInput label="" value={downloadUrl} />
            </div>

            <!-- Main Editor Layout -->
            <div class="editor-layout">
                <!-- Left Panel - Canvas -->
                <div class="preview-section" style="--zoom: {currentZoom}">
                    <!-- Focal Point Label -->
                    <div class="focal-point-section">
                        <Typography.Text class="focal-point-label">
                            Focal point: {getFocalPointLabel()}
                        </Typography.Text>
                    </div>

                    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->

                    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
                    <Canvas.Root
                        bind:this={canvasCore}
                        settings={{
                            canPan: true,
                            canZoom: true,
                            canSelect: true,
                            grid: {
                                dotColor: 'var(--color-neutral-20)',
                                dotSize: 1,
                                dotOpacity: 100
                            }
                        }}
                        showGrid={true}
                        width="100%"
                        height="100%"
                        bind:objects={canvasObjects}>
                        <!-- Main Objects Loop -->
                        <div style="display: contents" onclick={handleFocalPointClick}>
                            {#each canvasObjects as obj (obj.id)}
                                {#if obj.type === 'image'}
                                    <Canvas.Image object={obj} />
                                {:else if obj.type === 'shape'}
                                    <Canvas.Shape object={obj} />
                                {/if}
                            {/each}
                        </div>

                        <!-- Focal Point Overlay (Manually positioned to match main-image) -->
                        {#if focalPointOverlay || transformationState.gravity}
                            {#each canvasObjects as obj (obj.id)}
                                {#if obj.type === 'image' && obj.id === 'main-image'}
                                    {@const pos = getFocalPointPosition()}
                                    <div
                                        class="focal-point-layer"
                                        style="
                                            position: absolute;
                                            transform: translate3d({obj.x}px, {obj.y}px, 0);
                                            width: {obj.width}px;
                                            height: {obj.height}px;
                                            pointer-events: none;
                                            z-index: 5;
                                        ">
                                        <div
                                            class="focal-overlay"
                                            style="top: {pos.top}; left: {pos.left}; width: {pos.width}; height: {pos.height};">
                                        </div>
                                    </div>
                                {/if}
                            {/each}
                        {/if}
                    </Canvas.Root>

                    <div class="overlay-controls">
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

    .preview-wrapper {
        position: relative;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform-origin: center;
    }

    .preview-image {
        display: block;
        max-width: 100%;
        border-radius: var(--border-radius-small);
        user-select: none;
    }

    .focal-overlay {
        position: absolute;
        background: rgba(59, 130, 246, 0.3);
        border: 2px solid rgba(59, 130, 246, 0.6);
        pointer-events: none;
        transition: all 0.2s;
    }

    .overlay-controls {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        pointer-events: none;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        z-index: 10;
    }

    /* Fallback styles for resize handles to ensure visibility */
    /* Fallback styles for resize handles to ensure visibility */
    :global(.resize-handle) {
        width: 10px !important;
        height: 10px !important;
        background-color: var(--color-primary-100, #00d9ff) !important;
        border: 1px solid blue !important;
        z-index: 20 !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        /* Inverse scale to keep constant size */
        transform: scale(calc(1 / var(--zoom, 1))) !important;
        transform-origin: center !important;
    }

    :global(.resize-handle:hover) {
        /* Scale up slightly from the base inverse scale */
        transform: scale(calc(1.2 / var(--zoom, 1))) !important;
    }

    .overlay-controls > * {
        pointer-events: auto;
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
