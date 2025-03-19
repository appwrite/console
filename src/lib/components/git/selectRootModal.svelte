<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { iconPath } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { VCSDetectionType } from '@appwrite.io/console';
    import { DirectoryPicker } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';

    type Directory = {
        title: string;
        fullPath: string;
        fileCount: number;
        thumbnailUrl: string;
        children?: Directory[];
    };

    export let show = false;
    export let rootDir: string;
    export let product: 'sites' | 'functions' = 'functions';

    let isLoading = true;
    let directories: Directory[] = [
        {
            title: 'Root',
            fullPath: './',
            fileCount: 0,
            thumbnailUrl: 'root',
            children: []
        }
    ];
    let currentPath: string = './';

    onMount(async () => {
        try {
            const content = await sdk.forProject.vcs.getRepositoryContents(
                $installation.$id,
                $repository.id,
                currentPath
            );
            // console.log(content);
            directories[0].fileCount = content.contents?.length ?? 0;
            directories[0].children = content.contents
                .filter((e) => e.isDirectory)
                .map((dir) => ({
                    title: dir.name,
                    fullPath: currentPath + dir.name,
                    fileCount: undefined,
                    thumbnailUrl: dir.name
                }));
            // console.log(directories);
            isLoading = false;
        } catch (e) {
            console.log(e);
        }
    });

    async function fetchContents(e: CustomEvent) {
        const path = e.detail.fullPath;
        currentPath = path;
        try {
            const content = await sdk.forProject.vcs.getRepositoryContents(
                $installation.$id,
                $repository.id,
                path
            );
            // console.log(content);
            const fileCount = content.contents?.length ?? 0;
            const contentDirectories = content.contents.filter((e) => e.isDirectory);

            if (contentDirectories.length === 0) {
                return;
            }
            let currentDir = directories[0];
            for (let i = 1; i < path.split('/').length; i++) {
                const dir = path.split('/')[i];
                currentDir = currentDir.children.find((d) => d.title === dir);
            }

            currentDir.fileCount = fileCount;
            currentDir.children = contentDirectories.map((dir) => ({
                title: dir.name,
                fullPath: path + '/' + dir.name,
                fileCount: undefined,
                thumbnailUrl: undefined
            }));
            const runtime = await sdk.forProject.vcs.createRepositoryDetection(
                $installation.$id,
                $repository.id,
                product === 'sites' ? VCSDetectionType.Framework : VCSDetectionType.Runtime,
                path
            );
            //TODO: Fix runtime after passing type: runtime.framework || runtime.runtime
            currentDir.children.forEach((dir) => {
                dir.thumbnailUrl = $iconPath(runtime.framework, 'color');
            });
            directories = [...directories];
        } catch (error) {
            console.error(error);
        }
    }

    function handleSubmit() {
        rootDir = currentPath;
        show = false;
    }

    // $: console.log(rootDir);
</script>

<Modal title="Root directory" bind:show onSubmit={handleSubmit}>
    <span slot="description">
        Select the directory where your site code is located using the menu below.
    </span>
    <DirectoryPicker {directories} {isLoading} on:select={fetchContents} />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Save</Button>
    </svelte:fragment>
</Modal>
