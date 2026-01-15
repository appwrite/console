<script lang="ts">
    import { Accordion, Typography } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import type { TransformationState } from '$lib/helpers/imageTransformations';
    import type { Preset } from './presetManager';
    import { createEventDispatcher } from 'svelte';
    import { InputNumber, InputSelect } from '$lib/elements/forms';

    let {
        activeTab = $bindable('design'),
        files,
        selectedFile = $bindable(null),
        transformationState = $bindable({}),
        presets,
        selectedPresetId = $bindable(null),
        zoom = $bindable(100)
    }: {
        activeTab?: 'design' | 'code';
        files: Models.File[];
        selectedFile?: Models.File | null;
        transformationState?: TransformationState & {
            aspectRatioLocked?: boolean;
            originalAspectRatio?: number;
            crop?: string;
        };
        presets: Preset[];
        selectedPresetId?: string | null;
        zoom?: number;
    } = $props();

    const dispatch = createEventDispatcher();

    // Crop options
    const cropOptions = [
        { label: 'None', value: 'none' },
        { label: '1:1', value: '1:1' },
        { label: '4:3', value: '4:3' },
        { label: '16:9', value: '16:9' },
        { label: 'Custom', value: 'custom' }
    ];

    const zoomOptions = [50, 75, 100, 125, 150, 200];

    // Local values for dimension inputs so we can bind to InputNumber and
    // still reuse the existing aspect-ratio logic.
    let widthValue = $state(0);
    let heightValue = $state(0);

    function handleFileSwitch(event: Event) {
        const select = event.target as HTMLSelectElement;
        const fileId = select.value;
        const file = files.find((f) => f.$id === fileId);
        if (file) {
            selectedFile = file;
        }
    }

    function handlePresetSwitch(event: Event) {
        const select = event.target as HTMLSelectElement;
        const presetId = select.value;
        selectedPresetId = presetId === 'none' ? null : presetId;
        dispatch('presetSelected', presetId === 'none' ? null : presetId);
    }

    function handleWidthChange(value: number) {
        transformationState.width = value;
        if (transformationState.aspectRatioLocked && transformationState.originalAspectRatio) {
            transformationState.height = Math.round(
                value / transformationState.originalAspectRatio
            );
        }
    }

    function handleHeightChange(value: number) {
        transformationState.height = value;
        if (transformationState.aspectRatioLocked && transformationState.originalAspectRatio) {
            transformationState.width = Math.round(value * transformationState.originalAspectRatio);
        }
    }

    // Keep local dimension values in sync with transformation state
    $effect(() => {
        widthValue = transformationState.width || 0;
        heightValue = transformationState.height || 0;
    });

    // Apply aspect-ratio aware updates whenever the local values change
    $effect(() => {
        handleWidthChange(widthValue);
    });

    $effect(() => {
        handleHeightChange(heightValue);
    });


    function toggleAspectRatioLock() {
        transformationState.aspectRatioLocked = !transformationState.aspectRatioLocked;
        if (
            transformationState.aspectRatioLocked &&
            transformationState.width &&
            transformationState.height
        ) {
            transformationState.originalAspectRatio =
                transformationState.width / transformationState.height;
        }
    }
</script>

<div class="panel">
    <!-- Header with file and preset selectors -->
    <div class="panel-header">
        <div class="file-selector">
            <InputSelect
                id="storage-image-file"
                placeholder=""
                value={selectedFile?.$id || ''}
                options={files.map((file) => ({
                    value: file.$id,
                    label: file.name
                }))}
                on:change={handleFileSwitch} />
        </div>
        <div class="preset-selector">
            <InputSelect
                id="storage-image-preset"
                placeholder="None"
                value={selectedPresetId || 'none'}
                options={[
                    { value: 'none', label: 'None' },
                    ...presets.map((preset) => ({
                        value: preset.id,
                        label: preset.name
                    }))
                ]}
                on:change={handlePresetSwitch} />
        </div>
    </div>

    <!-- Design/Code tabs and zoom -->
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
        <div class="zoom-selector">
            <select class="panel-select-small" bind:value={zoom}>
                {#each zoomOptions as option}
                    <option value={option}>{option}%</option>
                {/each}
            </select>
        </div>
    </div>

    {#if activeTab === 'design'}
        <!-- Transform Accordion -->
        <div class="accordion-group">
            <Accordion title="Transform" open>
                <div class="control-content">
                    <div class="control-row">
                        <Typography.Text variant="m-400" class="label-muted"
                            >Dimensions</Typography.Text>
                        <div class="dimensions-grid">
                            <!-- Width -->
                            <div class="input-group">
                                <span class="dim-label">W</span>
                                <InputNumber
                                    id="storage-image-width"
                                    placeholder=""
                                    min={1}
                                    max={4000}
                                    bind:value={widthValue} />
                            </div>
                            <!-- Height -->
                            <div class="input-group">
                                <span class="dim-label">H</span>
                                <InputNumber
                                    id="storage-image-height"
                                    placeholder=""
                                    min={1}
                                    max={4000}
                                    bind:value={heightValue} />
                            </div>
                            <!-- Lock -->
                            <button
                                class="lock-btn {transformationState.aspectRatioLocked
                                    ? 'is-locked'
                                    : ''}"
                                onclick={toggleAspectRatioLock}
                                aria-label="Toggle aspect ratio lock">
                                {#if transformationState.aspectRatioLocked}
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
                        <Typography.Text variant="m-400" class="label-muted">Crop</Typography.Text>
                        <InputSelect
                            id="storage-image-crop"
                            placeholder=""
                            value={transformationState.crop || 'none'}
                            options={cropOptions}
                            on:change={(e) => {
                                const target = e.target as HTMLInputElement;
                                transformationState.crop = target.value;
                            }} />
                    </div>
                </div>
            </Accordion>
        </div>

        <!-- Border Accordion -->
        <div class="accordion-group">
            <Accordion title="Border">
                <div class="control-content">
                    <div class="control-row">
                        <Typography.Text variant="m-400" class="label-muted">Color</Typography.Text>
                        <div class="color-input-wrapper">
                            <input
                                type="color"
                                class="color-input"
                                value={transformationState.borderColor
                                    ? `#${transformationState.borderColor}`
                                    : '#000000'}
                                oninput={(e) => {
                                    transformationState.borderColor = (
                                        e.target as HTMLInputElement
                                    ).value.replace('#', '');
                                }} />
                            <input
                                type="text"
                                class="color-text-input"
                                value={transformationState.borderColor || '000000'}
                                placeholder="000000"
                                oninput={(e) => {
                                    const value = (e.target as HTMLInputElement).value.replace(
                                        '#',
                                        ''
                                    );
                                    if (/^[0-9A-Fa-f]{0,6}$/.test(value)) {
                                        transformationState.borderColor = value;
                                    }
                                }} />
                            <div class="opacity-control">
                                <button
                                    class="opacity-minus-btn"
                                    onclick={() => {
                                        transformationState.borderOpacity = Math.max(
                                            0,
                                            (transformationState.borderOpacity || 100) - 1
                                        );
                                    }}
                                    aria-label="Decrease opacity">
                                    −
                                </button>
                                <input
                                    type="text"
                                    class="opacity-input"
                                    value={`${transformationState.borderOpacity || 100} %`}
                                    readonly />
                            </div>
                        </div>
                    </div>
                    <div class="control-row">
                        <Typography.Text variant="m-400" class="label-muted">Width</Typography.Text>
                        <div class="input-group">
                            <input
                                type="number"
                                class="panel-input"
                                value={transformationState.borderWidth || 0}
                                min="0"
                                max="100"
                                oninput={(e) => {
                                    transformationState.borderWidth =
                                        parseInt(e.currentTarget.value) || 0;
                                }} />
                            <div class="spinner-controls">
                                <button
                                    class="spinner-btn"
                                    onclick={() => {
                                        transformationState.borderWidth = Math.min(
                                            100,
                                            (transformationState.borderWidth || 0) + 1
                                        );
                                    }}>
                                    ▲
                                </button>
                                <button
                                    class="spinner-btn"
                                    onclick={() => {
                                        transformationState.borderWidth = Math.max(
                                            0,
                                            (transformationState.borderWidth || 0) - 1
                                        );
                                    }}>
                                    ▼
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="control-row">
                        <Typography.Text variant="m-400" class="label-muted"
                            >Border radius</Typography.Text>
                        <div class="border-radius-control">
                            <button
                                class="border-radius-icon-btn"
                                onclick={() => {
                                    // Link/unlink border radius
                                }}
                                aria-label="Link border radius">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path
                                        d="M4 2C2.89543 2 2 2.89543 2 4V12C2 13.1046 2.89543 14 4 14H12C13.1046 14 14 13.1046 14 12V4C14 2.89543 13.1046 2 12 2H4ZM3 4C3 3.44772 3.44772 3 4 3H12C12.5523 3 13 3.44772 13 4V12C13 12.5523 12.5523 13 12 13H4C3.44772 13 3 12.5523 3 12V4Z"
                                        fill-opacity="0.4" />
                                    <path
                                        d="M4 3C3.44772 3 3 3.44772 3 4V5H4V4H5V3H4Z"
                                        fill-opacity="0.6" />
                                </svg>
                            </button>
                            <input
                                type="number"
                                class="panel-input"
                                value={transformationState.borderRadius || 0}
                                min="0"
                                max="100"
                                oninput={(e) => {
                                    transformationState.borderRadius =
                                        parseInt(e.currentTarget.value) || 0;
                                }} />
                            <button
                                class="border-radius-link-btn"
                                onclick={() => {
                                    // Link corners
                                }}
                                aria-label="Link corners">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path
                                        d="M5 3L3 5L5 7L7 5L5 3ZM11 3L9 5L11 7L13 5L11 3ZM5 13L3 11L5 9L7 11L5 13ZM11 13L9 11L11 9L13 11L11 13Z"
                                        fill-opacity="0.4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </Accordion>
        </div>

        <!-- Fill Accordion -->
        <div class="accordion-group">
            <Accordion title="Fill">
                <div class="control-content">
                    <div class="control-row">
                        <Typography.Text variant="m-400" class="label-muted"
                            >Background Color</Typography.Text>
                        <input
                            type="color"
                            class="color-input-full"
                            value={transformationState.background
                                ? `#${transformationState.background}`
                                : '#ffffff'}
                            oninput={(e) => {
                                transformationState.background = (
                                    e.target as HTMLInputElement
                                ).value.replace('#', '');
                            }} />
                    </div>
                </div>
            </Accordion>
        </div>

        <!-- Export Accordion -->
        <div class="accordion-group">
            <Accordion title="Export">
                <div class="control-content">
                    <button class="export-button">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            class="export-icon">
                            <path
                                d="M2 2C2 1.44772 2.44772 1 3 1H6C6.55228 1 7 1.44772 7 2V3H13C13.5523 3 14 3.44772 14 4V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V2ZM3 2V13H13V4H7V2H3Z"
                                fill-opacity="0.4" />
                            <path
                                d="M4 4H12V5H4V4ZM4 7H12V8H4V7ZM4 10H9V11H4V10Z"
                                fill-opacity="0.6" />
                        </svg>
                        <span>Export</span>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            class="export-plus-icon">
                            <path
                                d="M8 3V13M3 8H13"
                                stroke="currentColor"
                                stroke-width="1.5"
                                fill="none" />
                        </svg>
                    </button>
                </div>
            </Accordion>
        </div>
    {/if}
</div>

<style>
    .panel {
        display: flex;
        flex-direction: column;
        background: var(--color-neutral-0);
        /* Let the outer editor layout own the border so the panel visually
           attaches to the right edge like the databases spreadsheet layout. */
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

    .zoom-selector {
        min-width: 70px;
    }

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

    .dim-label {
        color: var(--color-neutral-70);
        font-size: var(--font-size-0);
        font-weight: 500;
        margin-right: 0.5rem;
    }

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

    .full-width {
        width: 100%;
    }

    /* svelte-ignore css_unused_selector */
    .label-muted {
        color: var(--color-neutral-70);
    }

    .color-input-wrapper {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .color-input {
        width: 38px;
        height: 38px;
        padding: 2px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        cursor: pointer;
        background: var(--color-neutral-0);
    }

    .color-text-input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        background: var(--color-neutral-0);
        color: var(--color-neutral-100);
        font-size: var(--font-size-0);
        font-family: monospace;
    }

    .color-input-full {
        width: 100%;
        height: 38px;
        padding: 2px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        cursor: pointer;
        background: var(--color-neutral-0);
    }

    .border-radius-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .border-radius-icon-btn,
    .border-radius-link-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-small);
        background: var(--color-neutral-0);
        color: var(--color-neutral-50);
        cursor: pointer;
        padding: 0;
        flex-shrink: 0;
    }

    .border-radius-icon-btn:hover,
    .border-radius-link-btn:hover {
        background: var(--color-neutral-10);
        color: var(--color-neutral-80);
    }

    .border-radius-control .panel-input {
        flex: 1;
    }

    .export-button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--color-primary-100);
        color: white;
        border: none;
        border-radius: var(--border-radius-small);
        font-size: var(--font-size-0);
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    }

    .export-button:hover {
        background: var(--color-primary-110);
    }

    .export-icon,
    .export-icon,
    .export-plus-icon {
        flex-shrink: 0;
    }

    .export-plus-icon {
        margin-left: auto;
    }
</style>
