<script lang="ts">
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { ImageFormat, Query, type Models } from '@appwrite.io/console';
    import { Layout, Typography, Accordion } from '@appwrite.io/pink-svelte';
    import { onMount} from 'svelte';
    import { CopyInput, Tab, Tabs } from '$lib/components';

    // UI State
    let activeTab = $state<'design' | 'code'>('design');
    let bucketFiles = $state<Models.File[]>([]);
    let selectedFile = $state<Models.File | null>(null);
    let loading = $state(true);

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

    onMount(async () => {
        try {
            const response = await sdk
                .forProject(page.params.region, page.params.project)
                .storage.listFiles({
                    bucketId: page.params.bucket,
                    queries: [Query.limit(100), Query.orderDesc('$createdAt')]
                });
            bucketFiles = response.files;
            if (bucketFiles.length > 0) {
                selectedFile = bucketFiles[0];
            }
        } catch (error) {
            console.error('Failed to load bucket files:', error);
        } finally {
            loading = false;
        }
    });

    const drawCanvas = () => {
        if (!canvasEl || !selectedFile) return;
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

    $effect(() => {
        if (previewUrl && selectedFile) {
            drawCanvas();
        }
    });

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

    // Generate preview URL with transformations
    const getTransformedPreview = () => {
        if (!selectedFile) return '';

        const params: any = {
            bucketId: selectedFile.bucketId,
            fileId: selectedFile.$id,
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

    function handleFileSwitch(event: Event) {
        const select = event.target as HTMLSelectElement;
        const newFileId = select.value;
        const found = bucketFiles.find((f) => f.$id === newFileId);
        if (found) {
            selectedFile = found;
            // Reset dimensions or keep? Let's keep for now or maybe reset ratio if needed.
        }
    }

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

    function changeWidth(delta: number) {
        handleWidthChange(width + delta);
    }

    function changeHeight(delta: number) {
        handleHeightChange(height + delta);
    }

    const formatOptions = [
        { label: 'Original', value: null }, // Handle original format if needed, simplistic maps for now
        { label: 'JPG', value: ImageFormat.Jpg },
        { label: 'PNG', value: ImageFormat.Png },
        { label: 'GIF', value: ImageFormat.Gif },
        { label: 'WEBP', value: ImageFormat.Webp }
    ];
</script>

<Container>
    {#if loading}
        <Layout.Stack gap="l">
            <Typography.Text>Loading editor...</Typography.Text>
        </Layout.Stack>
    {:else if !selectedFile}
        <Layout.Stack gap="l">
            <div class="empty-state">
                <Typography.Title>Image Editor</Typography.Title>
                <Typography.Text>No files available to edit.</Typography.Text>
            </div>
        </Layout.Stack>
    {:else}
        <Layout.Stack gap="l">
            <!-- URL Input -->
            <div class="url-section">
                <CopyInput label="" value={previewUrl} />
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
                </div>

                <!-- Right Panel - Controls -->
                <div class="controls-section">
                    <!-- Top Header -->
                    <div class="panel-header">
                        <div class="file-selector">
                            <select
                                class="panel-select"
                                value={selectedFile.$id}
                                onchange={handleFileSwitch}>
                                {#each bucketFiles as f}
                                    <option value={f.$id}>{f.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="preset-selector">
                            <select class="panel-select text-subtle">
                                <option>None</option>
                            </select>
                        </div>
                    </div>

                    <!-- View Toggle -->
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
                                <option value={75}>75%</option>
                            </select>
                        </div>
                    </div>

                    <!-- Accordions -->
                    <!-- Transform -->
                    <div class="accordion-group">
                        <Accordion title="Transform" isOpen>
                            <div class="control-content">
                                <div class="control-row">
                                    <Typography.Text variant="m-400" class="label-muted"
                                        >Dimensions</Typography.Text>
                                    <div class="dimensions-grid">
                                        <!-- Width -->
                                        <div class="input-group">
                                            <span class="input-prefix">W</span>
                                            <input
                                                type="number"
                                                class="panel-input"
                                                value={width}
                                                oninput={(e) =>
                                                    handleWidthChange(
                                                        parseInt(e.currentTarget.value) || 0
                                                    )} />
                                            <div class="spinner-controls">
                                                <button
                                                    class="spinner-btn"
                                                    onclick={() => changeWidth(1)}>▲</button>
                                                <button
                                                    class="spinner-btn"
                                                    onclick={() => changeWidth(-1)}>▼</button>
                                            </div>
                                        </div>
                                        <!-- Height -->
                                        <div class="input-group">
                                            <span class="input-prefix">H</span>
                                            <input
                                                type="number"
                                                class="panel-input"
                                                value={height}
                                                oninput={(e) =>
                                                    handleHeightChange(
                                                        parseInt(e.currentTarget.value) || 0
                                                    )} />
                                            <div class="spinner-controls">
                                                <button
                                                    class="spinner-btn"
                                                    onclick={() => changeHeight(1)}>▲</button>
                                                <button
                                                    class="spinner-btn"
                                                    onclick={() => changeHeight(-1)}>▼</button>
                                            </div>
                                        </div>
                                        <!-- Lock -->
                                        <button
                                            class="lock-btn {aspectRatioLocked ? 'is-locked' : ''}"
                                            onclick={() =>
                                                (aspectRatioLocked = !aspectRatioLocked)}>
                                            <span class="icon-link"></span>
                                            <!-- Add lock icon here later if needed or usage CSS -->
                                            🔒
                                        </button>
                                    </div>
                                </div>

                                <div class="control-row">
                                    <Typography.Text variant="m-400" class="label-muted"
                                        >Crop</Typography.Text>
                                    <select class="panel-select" bind:value={focalPoint}>
                                        <option value="none" disabled>None</option>
                                        {#each focalPointOptions as option}
                                            <option value={option.value}>{option.label}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>
                        </Accordion>
                    </div>

                    <!-- Border -->
                    <div class="accordion-group">
                        <Accordion title="Border">
                            <div class="control-content">
                                <div class="control-row">
                                    <Typography.Text variant="m-400" class="label-muted"
                                        >Width</Typography.Text>
                                    <input
                                        type="number"
                                        class="panel-input"
                                        bind:value={borderWidth}
                                        min="0" />
                                </div>
                                {#if borderWidth > 0}
                                    <div class="control-row">
                                        <Typography.Text variant="m-400" class="label-muted"
                                            >Color</Typography.Text>
                                        <input
                                            type="color"
                                            class="color-input-full"
                                            bind:value={borderColor} />
                                    </div>
                                {/if}
                            </div>
                        </Accordion>
                    </div>

                    <!-- Fill -->
                    <div class="accordion-group">
                        <Accordion title="Fill">
                            <div class="control-content">
                                <div class="control-row">
                                    <Typography.Text variant="m-400" class="label-muted"
                                        >Background Color</Typography.Text>
                                    <input
                                        type="color"
                                        class="color-input-full"
                                        bind:value={backgroundColor} />
                                </div>
                            </div>
                        </Accordion>
                    </div>

                    <!-- Export -->
                    <div class="accordion-group">
                        <Accordion title="Export">
                            <div class="control-content">
                                <div class="control-row">
                                    <Typography.Text variant="m-400" class="label-muted"
                                        >Format</Typography.Text>
                                    <select class="panel-select" bind:value={outputFormat}>
                                        {#each formatOptions as option}
                                            {#if option.value}
                                                <option value={option.value}>{option.label}</option>
                                            {/if}
                                        {/each}
                                    </select>
                                </div>
                            </div>
                        </Accordion>
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

    .tabs-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--color-border);
    }

    .editor-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        height: 600px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-medium);
        overflow: hidden;
    }

    .preview-section {
        background: var(--color-neutral-10);
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
        background: rgba(255, 255, 255, 0.8);
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-small);
        pointer-events: none;
    }

    .preview-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 2rem;
    }

    .preview-wrapper {
        position: relative;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .preview-canvas {
        display: block;
        max-width: 100%;
        max-height: 480px;
        background: #fff;
    }

    .grid-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        border: 1px solid var(--color-primary-100);
    }

    .grid-line {
        position: absolute;
        background: rgba(253, 54, 110, 0.3); /* Brand color light */
    }

    .grid-line-v {
        top: 0;
        bottom: 0;
        width: 1px;
    }
    .grid-line-v:nth-child(1) {
        left: 33.33%;
    }
    .grid-line-v:nth-child(2) {
        left: 66.66%;
    }

    .grid-line-h {
        left: 0;
        right: 0;
        height: 1px;
    }
    .grid-line-h:nth-child(3) {
        top: 33.33%;
    }
    .grid-line-h:nth-child(4) {
        top: 66.66%;
    }

    .dimensions-text {
        margin-top: 1rem;
        background: var(--color-neutral-0);
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius-small);
        border: 1px solid var(--color-border);
    }

    .rotation-slider {
        position: absolute;
        bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--color-neutral-0);
        padding: 0.5rem;
        border-radius: var(--border-radius-medium);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .slider {
        width: 100px;
        accent-color: var(--color-primary-100);
    }

    .controls-section {
        display: flex;
        flex-direction: column;
        background: var(--color-neutral-0);
        border: 1px solid var(--color-border);
        border-right: none;
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
