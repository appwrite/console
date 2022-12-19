export function getFileExt(filename: string) {
    return filename.split('.').pop();
}

export function getFileName(filename: string) {
    return filename.split('.').slice(0, -1).join('.');
}
