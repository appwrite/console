<script lang="ts">
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { ImageFormat, Query, type Models } from '@appwrite.io/console';
import { Layout, Typography, Input } from '@appwrite.io/pink-svelte';
import { onMount } from 'svelte';
    import { Copy } from '$lib/components';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { InputSelect } from '$lib/elements/forms';
    import { draggable } from '@neodrag/svelte';
    import type { DragEventData } from '@neodrag/svelte';
import ImageGrid from './components/imageGrid.svelte';
import TransformationPanel from './components/transformationPanel.svelte';
import CodePanel from './components/codePanel.svelte';
import GridOverlay from './components/gridOverlay.svelte';
import { getPresets, type Preset } from './components/presetManager';
import type { TransformationState } from '$lib/helpers/imageTransformations';

    // UI State
    let activeTab = $state<'design' | 'code'>('design');
    let bucketFiles = $state<Models.File[]>([]);
    let selectedFile = $state<Models.File | null>(null);
    let loading = $state(true);
    let zoom = $state(100);

    // Transformation state
    let transformationState = $state<TransformationState & { aspectRatioLocked?: boolean; originalAspectRatio?: number; crop?: string }>({
        width: 700,
        height: 438,
        aspectRatioLocked: true,
        originalAspectRatio: 700 / 438,
        gravity: 'center',
        borderWidth: 0,
        borderColor: '000000',
        borderStyle: 'solid',
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
    let resizeStartDimensions = $state<{ width: number; height: number } | null>(null);

    // Derived values for selectors
    const fileOptions = $derived(bucketFiles.map(f => ({
        value: f.$id,
        label: f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name
    })));

    const presetOptions = $derived([
        { value: 'none', label: 'None' },
        ...presets.map(p => ({ value: p.id, label: p.name }))
    ]);

    let selectedFileId = $derived(selectedFile?.$id || '');

    function handleFileChange(event: CustomEvent) {
        const fileId = event.detail;
        const file = bucketFiles.find((f) => f.$id === fileId);
        if (file) {
            selectedFile = file;
        }
    }

    function handlePresetChangeTop(event: CustomEvent) {
        const value = event.detail;
        selectedPresetId = value === 'none' ? null : value;
        handlePresetSelected(selectedPresetId);
    }

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
        };
        img.src = getPreviewUrl();
    }

    function getPreviewUrl(): string {
        if (!selectedFile) return '';
        
        // Build params for SDK (camelCase)
        const sdkParams: any = {
            bucketId: selectedFile.bucketId,
            fileId: selectedFile.$id
        };
        
        if (transformationState.width) sdkParams.width = transformationState.width;
        if (transformationState.height) sdkParams.height = transformationState.height;
        if (transformationState.gravity && transformationState.gravity !== 'center') {
            sdkParams.gravity = transformationState.gravity;
        }
        if (transformationState.borderWidth && transformationState.borderWidth > 0) {
            sdkParams.borderWidth = transformationState.borderWidth;
            if (transformationState.borderColor) {
                sdkParams.borderColor = transformationState.borderColor.replace('#', '');
            }
            if (transformationState.borderStyle) {
                sdkParams.borderStyle = transformationState.borderStyle;
            }
        }
        if (transformationState.borderRadius && transformationState.borderRadius > 0) {
            sdkParams.borderRadius = transformationState.borderRadius;
        }
        if (transformationState.background) {
            sdkParams.background = transformationState.background.replace('#', '');
        }
        if (transformationState.quality && transformationState.quality < 100) {
            sdkParams.quality = transformationState.quality;
        }
        if (transformationState.output) {
            sdkParams.output = transformationState.output;
        }
        if (transformationState.rotation && transformationState.rotation !== 0) {
            sdkParams.rotation = transformationState.rotation;
        }
        
        const baseUrl = sdk
            .forProject(page.params.region, page.params.project)
            .storage.getFilePreview(sdkParams)
            .toString();
        
        // Format URL parameters to match the desired format (kebab-case)
        const url = new URL(baseUrl);
        const params = new URLSearchParams();
        
        // Convert camelCase to kebab-case for display
        url.searchParams.forEach((value, key) => {
            if (key === 'width') {
                params.set('w', value);
            } else if (key === 'height') {
                params.set('h', value);
            } else if (key === 'borderWidth') {
                params.set('border', value);
            } else if (key === 'borderColor') {
                params.set('border-color', value);
            } else if (key === 'borderStyle') {
                params.set('border-style', value);
            } else if (key === 'borderRadius') {
                params.set('border-radius', value);
            } else {
                params.set(key, value);
            }
        });
        
        return `${url.origin}${url.pathname}?${params.toString()}&mode=admin`;
    }

    let previewUrl = $derived(getPreviewUrl());

    // Watch for file selection changes and apply presets
    $effect(() => {
        if (selectedFile) {
            // Reset transformations or apply preset if one is selected for this file
            if (appliedPresets[selectedFile.$id]) {
                const preset = presets.find((p) => p.id === appliedPresets[selectedFile.$id]);
                if (preset) {
                    transformationState = { ...preset.transformations };
                }
            } else {
                loadImageDimensions();
            }
        }
    });

    function handleFocalPointClick(event: MouseEvent) {
        if (!canvasContainer || !selectedFile || resizeStartDimensions) return;
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
    }

    // Store handle positions to keep them at corners
    let handlePosNw = $state({ x: 0, y: 0 });
    let handlePosNe = $state({ x: 0, y: 0 });
    let handlePosSw = $state({ x: 0, y: 0 });
    let handlePosSe = $state({ x: 0, y: 0 });

    function createResizeHandler(handle: string) {
        // Determine cursor and axis based on handle position
        const isDiagonal = handle.length === 2;
        const axis = isDiagonal ? 'both' : (handle.includes('e') || handle.includes('w') ? 'x' : 'y');
        
        // Get the appropriate handle position based on handle name
        let handlePos: { x: number; y: number };
        if (handle === 'nw') handlePos = handlePosNw;
        else if (handle === 'ne') handlePos = handlePosNe;
        else if (handle === 'sw') handlePos = handlePosSw;
        else handlePos = handlePosSe;
        
        return {
            onDragStart: () => {
                resizeStartDimensions = {
                    width: transformationState.width || 0,
                    height: transformationState.height || 0
                };
                handlePos.x = 0;
                handlePos.y = 0;
            },
            onDrag: ({ offsetX, offsetY }: DragEventData) => {
                if (!resizeStartDimensions) return;
                
                const scale = zoom / 100;
                // Calculate dimension changes based on drag offset
                const dx = offsetX / scale;
                const dy = offsetY / scale;

                let newWidth = resizeStartDimensions.width;
                let newHeight = resizeStartDimensions.height;

                // Calculate new dimensions based on handle position
                // East (right) handle: increase width
                if (handle.includes('e')) {
                    newWidth = Math.max(1, resizeStartDimensions.width + dx);
                }
                // West (left) handle: decrease width
                if (handle.includes('w')) {
                    newWidth = Math.max(1, resizeStartDimensions.width - dx);
                }
                // South (bottom) handle: increase height
                if (handle.includes('s')) {
                    newHeight = Math.max(1, resizeStartDimensions.height + dy);
                }
                // North (top) handle: decrease height
                if (handle.includes('n')) {
                    newHeight = Math.max(1, resizeStartDimensions.height - dy);
                }

                // Apply aspect ratio lock with smooth calculation
                if (transformationState.aspectRatioLocked && transformationState.originalAspectRatio) {
                    // For diagonal handles, prefer width-based calculation
                    if (handle.includes('e') || handle.includes('w')) {
                        newHeight = Math.round(newWidth / transformationState.originalAspectRatio);
                    } else {
                        newWidth = Math.round(newHeight * transformationState.originalAspectRatio);
                    }
                }

                // Apply with smooth transition (physics-like)
                transformationState.width = Math.round(newWidth);
                transformationState.height = Math.round(newHeight);
                
                // Reset handle position to keep it at the corner
                handlePos.x = 0;
                handlePos.y = 0;
            },
            onDragEnd: () => {
                resizeStartDimensions = null;
                handlePos.x = 0;
                handlePos.y = 0;
            },
            // Physics-like behavior: grid snapping and smooth movement
            grid: [5, 5], // Snap to 5px grid for smoother feel
            threshold: { distance: 2 }, // Small threshold to prevent accidental drags
            gpuAcceleration: true, // Smooth hardware-accelerated movement
            axis: axis as 'both' | 'x' | 'y', // Constrain movement based on handle
            // Keep handle at corner by resetting position reactively
            position: handlePos,
            // Add smooth easing for physics-like feel
            defaultClassDragging: 'resizing'
        };
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
                transformationState={transformationState}
                appliedPresets={appliedPresets} />
        </Layout.Stack>
    {:else}
        <!-- Editor View -->
        <div class="editor-wrapper">
            <!-- Top Header: URL + File/Preset Selectors -->
            <div class="editor-header">
                <div class="url-input-wrapper">
                    <Input.Text readonly value={previewUrl.replace(/^https?:\/\//, '')}>
                        <span class="url-prefix" slot="start">https://</span>
                        <Copy value={previewUrl} slot="end">
                            <Input.Action icon={IconDuplicate} />
                        </Copy>
                    </Input.Text>
                </div>
                <div class="header-selectors">
                    <InputSelect
                        id="file-selector-top"
                        options={fileOptions}
                        value={selectedFileId}
                        on:change={handleFileChange}
                        placeholder="Select file" />
                    <InputSelect
                        id="preset-selector-top"
                        options={presetOptions}
                        value={selectedPresetId || 'none'}
                        on:change={handlePresetChangeTop}
                        placeholder="None" />
                </div>
            </div>

            <!-- Main Editor Layout -->
            <div class="editor-layout">
                <!-- Left Panel - Canvas -->
                <div class="preview-section">
                    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
                    <div
                        class="preview-container"
                        bind:this={canvasContainer}
                        onclick={handleFocalPointClick}
                        role="img"
                        tabindex="-1">
                        <div class="preview-wrapper" style="transform: scale({zoom / 100});">
                            <img
                                src={previewUrl}
                                alt={selectedFile.name}
                                class="preview-image"
                                style="width: {transformationState.width || 0}px; height: {transformationState.height || 0}px;"
                                draggable="false" />
                            <!-- Grid overlay (rule of thirds) -->
                            <GridOverlay type="rule-of-thirds" />
                            <!-- Resize handles with neodrag -->
                            <div class="resize-handles">
                                <button
                                    type="button"
                                    class="handle handle-nw"
                                    use:draggable={createResizeHandler('nw')}
                                    aria-label="Resize from top-left"></button>
                                <button
                                    type="button"
                                    class="handle handle-ne"
                                    use:draggable={createResizeHandler('ne')}
                                    aria-label="Resize from top-right"></button>
                                <button
                                    type="button"
                                    class="handle handle-sw"
                                    use:draggable={createResizeHandler('sw')}
                                    aria-label="Resize from bottom-left"></button>
                                <button
                                    type="button"
                                    class="handle handle-se"
                                    use:draggable={createResizeHandler('se')}
                                    aria-label="Resize from bottom-right"></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Controls Sidebar -->
                <div class="controls-section">
                    <TransformationPanel
                        bind:activeTab
                        bind:transformationState
                        bind:zoom />

                    {#if activeTab === 'code' && selectedFile}
                        <div class="code-panel-wrapper">
                            <CodePanel
                                {transformationState}
                                bucketId={selectedFile.bucketId}
                                fileId={selectedFile.$id} />
                        </div>
                    {/if}
                </div>
            </div>
        </div>
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

    .editor-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--space-m);
    }

    .editor-header {
        display: flex;
        align-items: center;
        gap: var(--space-m);
    }

    .url-input-wrapper {
        flex: 1;
    }

    .header-selectors {
        display: flex;
        gap: var(--space-s);
    }

    :global(.header-selectors > *) {
        min-width: 120px;
    }

    .editor-layout {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 0;
        min-height: 550px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        overflow: hidden;
    }

    .preview-section {
        background: var(--color-neutral-10);
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .preview-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: var(--space-xl);
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
        cursor: nwse-resize;
        transition: transform 0.1s ease-out, background-color 0.2s;
        will-change: transform;
    }

    .handle:hover {
        transform: scale(1.2);
        background: var(--color-primary-110);
    }

    .handle-nw {
        top: -6px;
        left: -6px;
        cursor: nwse-resize;
    }

    .handle-ne {
        top: -6px;
        right: -6px;
        cursor: nesw-resize;
    }

    .handle-sw {
        bottom: -6px;
        left: -6px;
        cursor: nesw-resize;
    }

    .handle-se {
        bottom: -6px;
        right: -6px;
        cursor: nwse-resize;
    }

    /* Smooth transitions for image dimensions with physics-like easing */
    .preview-image {
        transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1), height 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Resizing state for handles (applied by neodrag) */
    :global(.resizing) {
        opacity: 0.9;
    }

    :global(.resizing .handle) {
        transform: scale(1.3);
        background: var(--color-primary-110);
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
        flex: 1;
        overflow-y: auto;
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
