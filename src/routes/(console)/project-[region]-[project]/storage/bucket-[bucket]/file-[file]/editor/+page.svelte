<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { ImageFormat, Query, type Models } from '@appwrite.io/console';
    import { Layout, Typography, Accordion, Input } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import { file } from '../store';
    import { Tab, Tabs } from '$lib/components';

    // UI State
    let activeTab = $state<'design' | 'code'>('design');
    let bucketFiles = $state<Models.File[]>([]);

    onMount(async () => {
        try {
            const response = await sdk
                .forProject(page.params.region, page.params.project)
                .storage.listFiles({
                    bucketId: page.params.bucket,
                    queries: [Query.limit(100), Query.orderDesc('$createdAt')]
                });
            bucketFiles = response.files;
        } catch (error) {
            console.error('Failed to load bucket files:', error);
        }
    });

    function handleFileSwitch(event: Event) {
        const select = event.target as HTMLSelectElement;
        const newFileId = select.value;
        if (newFileId && newFileId !== $file?.$id) {
            goto(
                `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/file-${newFileId}/editor`
            );
        }
    }

    // Transformation state
    let width = $state(584);
    let height = $state(438);
    let aspectRatioLocked = $state(true);
    let originalAspectRatio = $state(584 / 438);

    // Focal point
    let focalPoint = $state<string>('bottom-left');
    const focalPointOptions = [
        { label: 'Top-Left', value: 'top-left' },
        { label: 'Top', value: 'top' },
        { label: 'Top-Right', value: 'top-right' },
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
        { label: 'Bottom-Left', value: 'bottom-left' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Bottom-Right', value: 'bottom-right' }
    ];

    // Crop/Gravity options
    let gravity = $state<string>('4:3');
    const gravityOptions = [
        { label: '4:3', value: '4:3' },
        { label: '16:9', value: '16:9' },
        { label: '1:1', value: '1:1' },
        { label: 'Custom', value: 'custom' }
    ];

    // Border
    let borderWidth = $state(0);
    let borderColor = $state('#000000');

    // Background fill
    let backgroundColor = $state('');

    // Export settings
    let outputFormat = $state<ImageFormat>(ImageFormat.Jpg);
    let quality = $state(100);

    // Canvas handling
    let canvasEl = $state<HTMLCanvasElement>();
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const drawCanvas = () => {
        if (!canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = previewUrl;
        img.onload = () => {
            canvasEl.width = width;
            canvasEl.height = height;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
        };
    };

    $effect(() => drawCanvas());

    function onMouseDown(event: MouseEvent) {
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
    }
    function onMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        const dx = event.clientX - startX;
        const dy = event.clientY - startY;
        width = Math.max(1, width + dx);
        height = Math.max(1, height + dy);
        startX = event.clientX;
        startY = event.clientY;
    }
    function onMouseUp() {
        isDragging = false;
    }

    const formatOptions = [
        { label: 'image.jpg', value: ImageFormat.Jpg },
        { label: 'image.png', value: ImageFormat.Png },
        { label: 'image.gif', value: ImageFormat.Gif },
        { label: 'image.webp', value: ImageFormat.Webp }
    ];

    // Generate preview URL with transformations
    const getTransformedPreview = () => {
        if (!$file) return '';

        const params: any = {
            bucketId: $file.bucketId,
            fileId: $file.$id,
            width,
            height,
            output: outputFormat
        };

        if (focalPoint !== 'center') {
            params.gravity = focalPoint;
        }

        if (borderWidth > 0) {
            params.borderWidth = borderWidth;
            params.borderColor = borderColor.replace('#', '');
        }

        if (backgroundColor) {
            params.background = backgroundColor.replace('#', '');
        }

        if (quality < 100) {
            params.quality = quality;
        }

        return (
            sdk
                .forProject(page.params.region, page.params.project)
                .storage.getFilePreview(params)
                .toString() + '&mode=admin'
        );
    };

    let previewUrl = $derived(getTransformedPreview());

    // Handle dimension changes with aspect ratio lock
    function handleWidthChange(newWidth: number) {
        width = newWidth;
        if (aspectRatioLocked && originalAspectRatio) {
            height = Math.round(newWidth / originalAspectRatio);
        }
    }

    function handleHeightChange(newHeight: number) {
        height = newHeight;
        if (aspectRatioLocked && originalAspectRatio) {
            width = Math.round(newHeight * originalAspectRatio);
        }
    }
</script>

<Container>
    <Layout.Stack gap="l">
        <!-- URL Input -->
        <div class="url-section">
            <Input.Text readonly value={previewUrl.split('://')[1]}>
                <span class="url-prefix" slot="start">{previewUrl.split('://')[0]}://</span>
            </Input.Text>
        </div>

        <!-- Design/Code Tabs with Quality Selector -->
        <div class="tabs-section">
            <Tabs>
                <Tab selected={activeTab === 'design'} on:click={() => (activeTab = 'design')}>
                    Design
                </Tab>
                <Tab selected={activeTab === 'code'} on:click={() => (activeTab = 'code')}>
                    Code
                </Tab>
            </Tabs>
            <div class="quality-selector">
                <select class="input-text-small" bind:value={quality}>
                    <option value={100}>100%</option>
                    <option value={90}>90%</option>
                    <option value={80}>80%</option>
                    <option value={70}>70%</option>
                    <option value={50}>50%</option>
                </select>
            </div>
        </div>

        <!-- Main Editor Layout -->
        <div class="editor-layout">
            <!-- Left Panel - Preview -->
            <div class="preview-section">
                {#if $file}
                    <!-- Focal Point Selector -->
                    <div class="focal-point-section">
                        <Typography.Text class="focal-point-label">
                            Focal point: {focalPointOptions.find((opt) => opt.value === focalPoint)
                                ?.label || 'Bottom-Left'}
                        </Typography.Text>
                    </div>

                    <div class="preview-container">
                        <div class="preview-wrapper">
                            <canvas
                                bind:this={canvasEl}
                                class="preview-canvas"
                                onmousedown={onMouseDown}
                                onmousemove={onMouseMove}
                                onmouseup={onMouseUp}
                                onmouseleave={onMouseUp}></canvas>
                            <!-- Grid overlay -->
                            <div class="grid-overlay">
                                <div class="grid-line grid-line-v"></div>
                                <div class="grid-line grid-line-v"></div>
                                <div class="grid-line grid-line-h"></div>
                                <div class="grid-line grid-line-h"></div>
                            </div>
                        </div>
                        <Typography.Text variant="m-400" class="dimensions-text">
                            {width} × {height}
                        </Typography.Text>

                        <!-- Rotation slider -->
                        <div class="rotation-slider">
                            <input type="range" min="0" max="360" value="0" class="slider" />
                            <Typography.Text class="rotation-text">0°</Typography.Text>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Right Panel - Controls -->
            <div class="controls-section">
                <!-- Top Header -->
                <div class="panel-header">
                    <div class="file-selector">
                        <select class="panel-select" value={$file?.$id} onchange={handleFileSwitch}>
                            {#if bucketFiles.length > 0}
                                {#each bucketFiles as f}
                                    <option value={f.$id}>{f.name}</option>
                                {/each}
                            {:else}
                                <option value={$file?.$id}>{$file?.name}</option>
                            {/if}
                        </select>
                    </div>
                    <div class="preset-selector">
                        <select class="panel-select">
                            <option>None</option>
                        </select>
                    </div>
                </div>

                <!-- View Toggle (Design/Code) -->
                <div class="view-toggle-section">
                    <div class="segmented-control">
                        <button
                            class="segment-btn {activeTab === 'design' ? 'is-active' : ''}"
                            onclick={() => (activeTab = 'design')}>
                            Design
                        </button>
                        <button
                            class="segment-btn {activeTab === 'code' ? 'is-active' : ''}"
                            onclick={() => (activeTab = 'code')}>
                            Code
                        </button>
                    </div>
                    <div class="quality-selector">
                        <select class="panel-select-small" bind:value={quality}>
                            <option value={100}>100%</option>
                            <option value={90}>90%</option>
                            <option value={80}>80%</option>
                            <option value={70}>70%</option>
                            <option value={50}>50%</option>
                        </select>
                    </div>
                </div>

                <!-- Transform Section -->
                <div class="accordion-group">
                    <Accordion title="Transform">
                        <div class="control-content">
                            <div class="control-row">
                                <Typography.Text variant="m-400" class="label-muted"
                                    >Dimensions</Typography.Text>
                                <div class="dimensions-grid">
                                    <div class="input-group">
                                        <span class="input-prefix">W</span>
                                        <input
                                            type="number"
                                            class="panel-input"
                                            value={width}
                                            min="1"
                                            max="4000"
                                            oninput={(e) =>
                                                handleWidthChange(Number(e.currentTarget.value))} />
                                        <div class="spinner-controls">
                                            <button
                                                class="spinner-btn"
                                                onclick={() => handleWidthChange(width + 1)}
                                                >▲</button>
                                            <button
                                                class="spinner-btn"
                                                onclick={() => handleWidthChange(width - 1)}
                                                >▼</button>
                                        </div>
                                    </div>
                                    <div class="input-group">
                                        <span class="input-prefix">H</span>
                                        <input
                                            type="number"
                                            class="panel-input"
                                            value={height}
                                            min="1"
                                            max="4000"
                                            oninput={(e) =>
                                                handleHeightChange(
                                                    Number(e.currentTarget.value)
                                                )} />
                                        <div class="spinner-controls">
                                            <button
                                                class="spinner-btn"
                                                onclick={() => handleHeightChange(height + 1)}
                                                >▲</button>
                                            <button
                                                class="spinner-btn"
                                                onclick={() => handleHeightChange(height - 1)}
                                                >▼</button>
                                        </div>
                                    </div>
                                    <button
                                        class="lock-btn {aspectRatioLocked ? 'is-locked' : ''}"
                                        onclick={() => (aspectRatioLocked = !aspectRatioLocked)}>
                                        {#if aspectRatioLocked}
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="currentColor">
                                                <path
                                                    d="M12 6H11V4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4V6H4C2.89543 6 2 6.89543 2 8V14C2 15.1046 2.89543 16 4 16H12C13.1046 16 14 15.1046 14 14V8C14 6.89543 13.1046 6 12 6ZM7 4C7 3.44772 7.44772 3 8 3C8.55228 3 9 3.44772 9 4V6H7V4ZM12 14H4V8H12V14Z"
                                                    fill-opacity="0.4" />
                                            </svg>
                                        {:else}
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="currentColor">
                                                <path
                                                    d="M11 6H12C13.1046 6 14 6.89543 14 8V14C14 15.1046 13.1046 16 12 16H4C2.89543 16 2 15.1046 2 14V8C2 6.89543 2.89543 6 4 6H5V4C5 2.34315 6.34315 1 8 1C9.65685 1 11 2.34315 11 4V6ZM7 6V4C7 3.44772 7.44772 3 8 3C8.55228 3 9 3.44772 9 4V6H7ZM4 8V14H12V8H4Z"
                                                    fill-opacity="0.4" />
                                            </svg>
                                        {/if}
                                    </button>
                                </div>
                            </div>

                            <div class="control-row">
                                <Typography.Text variant="m-400" class="label-muted"
                                    >Crop</Typography.Text>
                                <select class="panel-select full-width" bind:value={gravity}>
                                    <option value="none">None</option>
                                    {#each gravityOptions as option}
                                        <option value={option.value}>{option.label}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    </Accordion>
                </div>

                <!-- Border Section -->
                <div class="accordion-group">
                    <Accordion title="Border">
                        <div class="control-content">
                            <div class="control-row">
                                <div class="input-group full-width">
                                    <input
                                        type="number"
                                        class="panel-input"
                                        placeholder="Width"
                                        bind:value={borderWidth}
                                        min="0"
                                        max="100" />
                                    {#if borderWidth > 0}
                                        <input
                                            type="color"
                                            class="color-input-small"
                                            bind:value={borderColor} />
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </Accordion>
                </div>

                <!-- Fill Section -->
                <div class="accordion-group">
                    <Accordion title="Fill">
                        <div class="control-content">
                            <div class="control-row">
                                <input
                                    type="color"
                                    class="color-input-full"
                                    bind:value={backgroundColor} />
                            </div>
                        </div>
                    </Accordion>
                </div>

                <!-- Export Section -->
                <div class="accordion-group">
                    <Accordion title="Export">
                        <div class="control-content">
                            <div class="control-row">
                                <select class="panel-select full-width" bind:value={outputFormat}>
                                    {#each formatOptions as option}
                                        <option value={option.value}>{option.label}</option>
                                    {/each}
                                </select>
                            </div>
                        </div>
                    </Accordion>
                </div>
            </div>
        </div>
    </Layout.Stack>
</Container>

<style>
    .main-tabs-section {
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--color-border);
    }

    .url-section {
        margin-bottom: 1rem;
    }

    .tabs-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--color-border);
        padding-bottom: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .quality-selector {
        min-width: 80px;
    }

    .input-text-small {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        background: var(--color-neutral-0);
        color: var(--color-neutral-100);
        font-size: var(--font-size-0);
    }

    .editor-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 2rem;
        min-height: 600px;
    }

    .preview-section {
        display: flex;
        flex-direction: column;
        background: var(--color-neutral-5);
        border-radius: var(--border-radius-small);
        padding: 1.5rem;
    }

    .focal-point-section {
        margin-bottom: 1rem;
        text-align: center;
    }

    :global(.focal-point-label) {
        color: var(--color-neutral-70);
    }

    .preview-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        flex: 1;
        justify-content: center;
    }

    .preview-wrapper {
        position: relative;
        display: inline-block;
    }

    .preview-canvas {
        display: block;
        max-width: 100%;
        max-height: 450px;
        border-radius: var(--border-radius-small);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Removed old .preview-image styling */

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
        width: 1px;
        height: 100%;
        top: 0;
    }

    .grid-line-v:nth-child(1) {
        left: 33.33%;
    }

    .grid-line-v:nth-child(2) {
        left: 66.66%;
    }

    .grid-line-h {
        height: 1px;
        width: 100%;
        left: 0;
    }

    .grid-line-h:nth-child(3) {
        top: 33.33%;
    }

    .grid-line-h:nth-child(4) {
        top: 66.66%;
    }

    :global(.dimensions-text) {
        color: var(--color-neutral-70);
        text-align: center;
    }

    .rotation-slider {
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
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-primary-100);
        cursor: pointer;
    }

    .slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--color-primary-100);
        cursor: pointer;
        border: none;
    }

    :global(.rotation-text) {
        color: var(--color-neutral-70);
        min-width: 30px;
        text-align: right;
    }

    .controls-section {
        display: flex;
        flex-direction: column;
        background: var(--color-neutral-0);
        border: 1px solid var(--color-border);
        border-right: none; /* If it's a side panel attached to edge */
        height: 100%;
    }

    .panel-header {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--color-border);
    }

    .view-toggle-section {
        padding: 0.75rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--color-border);
    }

    /* Segmented Control */
    .segmented-control {
        display: inline-flex;
        background: var(--color-neutral-10);
        padding: 2px;
        border-radius: var(--border-radius-small);
    }

    .segment-btn {
        padding: 0.25rem 0.75rem;
        font-size: var(--font-size-0);
        font-weight: 500;
        color: var(--color-neutral-60);
        background: transparent;
        border: none;
        border-radius: calc(var(--border-radius-small) - 2px);
        cursor: pointer;
        transition: all 0.2s;
    }

    .segment-btn:hover {
        color: var(--color-neutral-100);
    }

    .segment-btn.is-active {
        background: var(--color-neutral-0);
        color: var(--color-neutral-100);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .quality-selector {
        min-width: 70px;
    }

    /* Accordions */
    .accordion-group {
        border-bottom: 1px solid var(--color-border);
        background: var(--color-neutral-0);
    }

    :global(.accordion-group .accordion-trigger) {
        padding: 1rem !important;
        font-weight: 500;
        color: var(--color-neutral-100);
    }

    .control-content {
        padding: 0 1rem 1rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .control-row {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    /* Inputs */
    .panel-select,
    .panel-select-small,
    .panel-input {
        width: 100%;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        background: var(--color-neutral-0);
        color: var(--color-neutral-100);
        font-size: var(--font-size-0);
        transition: border-color 0.2s;
    }

    .panel-select {
        padding: 0.5rem;
    }

    .panel-select-small {
        padding: 0.25rem 0.5rem;
    }

    .panel-input {
        padding: 0.5rem;
    }

    .panel-select:hover,
    .panel-input:hover {
        border-color: var(--color-neutral-50);
    }

    .panel-select:focus,
    .panel-input:focus {
        outline: none;
        border-color: var(--color-primary-100);
        box-shadow: 0 0 0 3px rgba(253, 54, 110, 0.1);
    }

    /* Dimensions Grid */
    .dimensions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 0.5rem;
        align-items: center;
    }

    .input-group {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-prefix {
        position: absolute;
        left: 0.75rem;
        color: var(--color-neutral-50);
        font-size: var(--font-size-0);
        font-weight: 500;
        pointer-events: none;
    }

    .dimensions-grid .panel-input {
        padding-left: 2rem; /* space for prefix */
        padding-right: 20px; /* space for spinner */
    }

    /* Spinner Controls */
    .spinner-controls {
        position: absolute;
        right: 2px;
        top: 2px;
        bottom: 2px;
        display: flex;
        flex-direction: column;
        width: 16px;
        border-left: 1px solid var(--color-border);
        background: var(--color-neutral-5);
        border-radius: 0 var(--border-radius-small) var(--border-radius-small) 0;
    }

    .spinner-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        font-size: 8px;
        color: var(--color-neutral-50);
        cursor: pointer;
        padding: 0;
    }

    .spinner-btn:hover {
        background: var(--color-neutral-10);
        color: var(--color-neutral-100);
    }

    /* URL Input Styles */
    .url-prefix {
        display: flex;
        align-items: center;
        padding: 0 0.75rem;
        height: 100%;
        background: var(--color-neutral-5);
        color: var(--color-neutral-60);
        font-size: var(--font-size-0);
        border-right: 1px solid var(--color-border);
        white-space: nowrap;
        user-select: none;
    }

    .spinner-btn:first-child {
        border-bottom: 1px solid var(--color-border);
    }

    /* Lock Button */
    .lock-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: var(--color-neutral-50);
        border-radius: var(--border-radius-small);
        cursor: pointer;
        transition: all 0.2s;
    }

    .lock-btn:hover {
        background: var(--color-neutral-10);
        color: var(--color-neutral-80);
    }

    .lock-btn.is-locked {
        color: var(--color-neutral-100);
    }

    /* Helpers */
    .full-width {
        width: 100%;
    }

    .label-muted {
        color: var(--color-neutral-70);
    }

    .color-input-small,
    .color-input-full {
        padding: 2px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        cursor: pointer;
        background: var(--color-neutral-0);
    }

    .color-input-small {
        width: 38px;
        height: 38px;
        flex-shrink: 0;
    }

    .color-input-full {
        width: 100%;
        height: 38px;
    }

    /* Layout Media Query */
    @media (max-width: 1024px) {
        .editor-layout {
            grid-template-columns: 1fr;
        }

        .controls-section {
            order: -1;
            border-right: 1px solid var(--color-border);
        }
    }
</style>
