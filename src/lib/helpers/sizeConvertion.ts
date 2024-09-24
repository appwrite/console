import prettyBytes from 'pretty-bytes';

const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] as const;
export type Size = (typeof sizes)[number];

export function calculateSize(bytes: number, decimals = 1, base: 1000 | 1024 = 1000) {
    if (bytes === 0) return '0 Bytes';

    const dm = decimals < 0 ? 0 : decimals;

    const i = Math.floor(Math.log(bytes) / Math.log(base));

    return parseFloat((bytes / Math.pow(base, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sizeToBytes(value: number, unit: Size, base = 1000) {
    const index = sizes.indexOf(unit);
    return value * Math.pow(base, index);
}

export function bytesToSize(value: number, unit: Size, base = 1000) {
    const index = sizes.indexOf(unit);
    return value / Math.pow(base, index);
}

export function mbSecondsToGBHours(value: number, base: 1000 | 1024 = 1000) {
    return value / base / (60 * 60);
}

export function humanFileSize(
    bytes: number,
    useBits = false
): {
    value: string;
    unit: Size;
} {
    if (typeof bytes !== 'number') return { value: '0', unit: 'Bytes' };
    const value = prettyBytes(bytes, {
        locale: 'en',
        bits: useBits
    }).split(' ');

    return {
        value: value[0],
        unit: value[1].toUpperCase() as Size
    };
}
