import { ImageFormat, type Models } from '@appwrite.io/console';

export type TransformationState = {
    width?: number;
    height?: number;
    gravity?: string; // focal point: 'top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'
    borderWidth?: number;
    borderColor?: string; // hex without #
    borderStyle?: string; // 'solid', 'dashed', 'dotted'
    borderOpacity?: number; // 0-100
    borderRadius?: number;
    background?: string; // hex without #
    quality?: number; // 1-100
    output?: ImageFormat;
    rotation?: number; // 0-360
};

export function generateTransformationParams(
    state: TransformationState
): Record<string, string | number> {
    const params: Record<string, string | number> = {};

    if (state.width) params.w = state.width;
    if (state.height) params.h = state.height;
    if (state.gravity && state.gravity !== 'center') {
        params.gravity = state.gravity;
    }
    if (state.borderWidth && state.borderWidth > 0) {
        params.border = state.borderWidth;
        if (state.borderColor) {
            params['border-color'] = state.borderColor.replace('#', '');
        }
        if (state.borderStyle) {
            params['border-style'] = state.borderStyle;
        }
    }
    if (state.borderRadius && state.borderRadius > 0) {
        params['border-radius'] = state.borderRadius;
    }
    if (state.background) {
        params.background = state.background.replace('#', '');
    }
    if (state.quality && state.quality < 100) {
        params.quality = state.quality;
    }
    if (state.output) {
        params.output = state.output;
    }
    if (state.rotation && state.rotation !== 0) {
        params.rotation = state.rotation;
    }

    return params;
}

export function generateSDKCode(
    state: TransformationState,
    bucketId: string,
    fileId: string,
    sdk: 'js' | 'python' | 'flutter' | 'swift' | 'kotlin'
): string {
    const params = generateTransformationParams(state);
    const paramStrings: string[] = [];

    // Build parameter object/string
    Object.entries(params).forEach(([key, value]) => {
        if (sdk === 'js' || sdk === 'python') {
            paramStrings.push(`    ${key}: ${typeof value === 'string' ? `'${value}'` : value}`);
        } else if (sdk === 'flutter' || sdk === 'swift' || sdk === 'kotlin') {
            paramStrings.push(`    ${key}: ${typeof value === 'string' ? `"${value}"` : value}`);
        }
    });

    const paramsBlock = paramStrings.length > 0 ? `,\n${paramStrings.join(',\n')}` : '';

    switch (sdk) {
        case 'js':
            return `storage.getFilePreview({
    bucketId: '${bucketId}',
    fileId: '${fileId}'${paramsBlock}
});`;

        case 'python':
            return `storage.get_file_preview(
    bucket_id='${bucketId}',
    file_id='${fileId}'${paramsBlock.replace(/(\w+):/g, '$1=')}
);`;

        case 'flutter':
            return `Storage.getFilePreview(
    bucketId: '${bucketId}',
    fileId: '${fileId}'${paramsBlock}
);`;

        case 'swift':
            return `storage.getFilePreview(
    bucketId: "${bucketId}",
    fileId: "${fileId}"${paramsBlock}
)`;

        case 'kotlin':
            return `storage.getFilePreview(
    bucketId = "${bucketId}",
    fileId = "${fileId}"${paramsBlock.replace(/(\w+):/g, '$1 =')}
)`;

        default:
            return '';
    }
}

export function getFormatLabel(format: ImageFormat): string {
    switch (format) {
        case ImageFormat.Jpg:
            return 'JPG';
        case ImageFormat.Png:
            return 'PNG';
        case ImageFormat.Gif:
            return 'GIF';
        case ImageFormat.Webp:
            return 'WEBP';
        case ImageFormat.Avif:
            return 'AVIF';
        default:
            return 'JPG';
    }
}

