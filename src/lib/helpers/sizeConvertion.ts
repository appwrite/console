import prettyBytes from 'pretty-bytes';

const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const;
export type Size = (typeof sizes)[number];

export function calculateSize(bytes: number, decimals = 1) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sizeToBytes(value: number, unit: Size, base = 1024) {
    const index = sizes.indexOf(unit);
    return value * Math.pow(base, index);
}

export function bytesToSize(value: number, unit: Size) {
    const index = sizes.indexOf(unit);
    return value / Math.pow(1024, index);
}

export function humanFileSize(bytes: number): {
    value: string;
    unit: Size;
} {
    if (typeof bytes !== 'number') return { value: '0', unit: 'Bytes' };
    const value = prettyBytes(bytes, {
        locale: 'en'
    }).split(' ');

    return {
        value: value[0],
        unit: value[1].toUpperCase() as Size
    };
}
