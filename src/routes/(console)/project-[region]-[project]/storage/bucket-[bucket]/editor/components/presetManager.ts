import type { TransformationState } from '$lib/helpers/imageTransformations';

export type Preset = {
    id: string;
    name: string;
    transformations: TransformationState;
    createdAt: number;
};

const STORAGE_PREFIX = 'image-presets-';

export function getPresets(bucketId: string): Preset[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${bucketId}`);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function savePreset(bucketId: string, preset: Preset): void {
    if (typeof window === 'undefined') return;
    try {
        const presets = getPresets(bucketId);
        const existingIndex = presets.findIndex((p) => p.id === preset.id);
        if (existingIndex >= 0) {
            presets[existingIndex] = preset;
        } else {
            presets.push(preset);
        }
        localStorage.setItem(`${STORAGE_PREFIX}${bucketId}`, JSON.stringify(presets));
    } catch (error) {
        console.error('Failed to save preset:', error);
    }
}

export function deletePreset(bucketId: string, presetId: string): void {
    if (typeof window === 'undefined') return;
    try {
        const presets = getPresets(bucketId);
        const filtered = presets.filter((p) => p.id !== presetId);
        localStorage.setItem(`${STORAGE_PREFIX}${bucketId}`, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete preset:', error);
    }
}

export function createPreset(
    name: string,
    transformations: TransformationState
): Preset {
    return {
        id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        transformations: { ...transformations },
        createdAt: Date.now()
    };
}

