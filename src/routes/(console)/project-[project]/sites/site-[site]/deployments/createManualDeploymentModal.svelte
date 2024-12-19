<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { uploader } from '$lib/stores/uploader';
    import type { Models } from '@appwrite.io/console';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Tooltip, Typography, Upload } from '@appwrite.io/pink-svelte';
    import { createTarGzip } from 'nanotar';
    import { defaultIgnore } from './store';
    import ignore from 'ignore';
    interface FileData {
        path: string;
        buffer: ArrayBuffer;
    }

    export let show = false;
    export let site: Models.Site;

    let files: FileList;
    let uploadFile: File;
    let error: string = '';

    async function handleChange() {
        const tick = performance.now();
        if (!files?.length) return;

        // If the file is a tar.gz file, then return it as is
        if (
            files?.length === 1 &&
            files.item(0).type === 'application/gzip' &&
            files.item(0).name.split('.').pop() === 'tar'
        ) {
            uploadFile = files.item(0);
        }
        // Else process the file to mantain the folder structure and create a .tar.gz file
        else {
            try {
                const processedFiles = await processFileList(files);
                const tar = await createTarGzip(
                    processedFiles.map((f) => ({
                        name: f.path,
                        data: f.buffer
                    }))
                );
                const blob = new Blob([tar], { type: 'application/gzip' });
                const file = new File([blob], 'deployment.tar.gz', { type: 'application/gzip' });
                uploadFile = file;
            } catch (e) {
                error = e;
            }
        }
        console.log(uploadFile);
        const tock = performance.now();
        console.log('Time taken to process files:', tock - tick);
    }

    async function processFileList(files: FileList): Promise<FileData[]> {
        const fileArray = Array.from(files);
        const ignorer = ignore();

        // Check for .gitignore file
        const gitignoreFile = fileArray.find(
            (file) => file.webkitRelativePath.endsWith('.gitignore') || file.name === '.gitignore'
        );

        if (gitignoreFile) {
            const gitignoreContent = await gitignoreFile.text();
            ignorer.add(gitignoreContent);
        } else {
            ignorer.add(defaultIgnore);
        }

        // Filter files using ignorer
        const filteredFiles = fileArray.filter((file) => {
            const path = file.webkitRelativePath || file.name;
            return !ignorer.ignores(path);
        });
        const filePromises = filteredFiles.map(async (file) => {
            try {
                const buffer = await file.arrayBuffer();
                return {
                    path: file?.webkitRelativePath || file.name,
                    buffer: buffer
                };
            } catch (e) {
                console.error(error);
                console.log(file);
                error = e;
            }
        });

        return Promise.all(filePromises);
    }

    async function createDeployment() {
        try {
            uploader.uploadSiteDeployment(site.$id, uploadFile);
            show = false;
            invalidate(Dependencies.DEPLOYMENTS);
            addNotification({
                message: 'Deployment has been created successfully',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }

    $: console.log(files);
</script>

<Modal title="Create manual deployment" bind:show onSubmit={createDeployment} {error}>
    <span slot="description"> Manually deploy a site by uploading any file(s) or folder. </span>
    <Upload.Dropzone folder bind:files on:change={handleChange}>
        <Layout.Stack alignItems="center" gap="s">
            <Layout.Stack alignItems="center" justifyContent="center" direction="row" gap="s">
                <Typography.Text variant="l-500">
                    Drag and drop files here or click to upload
                </Typography.Text>
                <Tooltip>
                    <Icon icon={IconInfo} size="s" />
                    <svelte:fragment slot="tooltip">
                        Only PNG, JPEG, PDF files allowed
                    </svelte:fragment>
                </Tooltip>
            </Layout.Stack>
            <Typography.Caption variant="400">Max file size: 10MB</Typography.Caption>
        </Layout.Stack>
    </Upload.Dropzone>
    {#if uploadFile}
        <Upload.List
            files={[
                {
                    name: uploadFile.name,
                    size: uploadFile.size,
                    extension: uploadFile.type
                }
            ]}>
        </Upload.List>
    {/if}
    <svelte:fragment slot="footer">
        <Button text size="s" on:click={() => (show = false)}>Cancel</Button>
        <Button size="s" disabled={!uploadFile} submit submissionLoader>Create</Button>
    </svelte:fragment>
</Modal>
