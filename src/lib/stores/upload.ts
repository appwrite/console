export function removeFile(file: File, files: FileList) {
    const filteredFiles = Array.from(files).filter((f) => f.name !== file.name);
    const dataTransfer = new DataTransfer();

    filteredFiles.forEach((file) => {
        dataTransfer.items.add(file);
    });

    files = dataTransfer.files;
}
