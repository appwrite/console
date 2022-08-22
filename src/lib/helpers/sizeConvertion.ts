const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function calculateSize(bytes: number, decimals = 1) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sizeToBytes(value: number, unit: string) {
    const index = sizes.indexOf(unit);
    return value * Math.pow(1024, index);
}
export function bytesToSize(value: number, unit: string) {
    const index = sizes.indexOf(unit);
    return value / Math.pow(1024, index);
}
