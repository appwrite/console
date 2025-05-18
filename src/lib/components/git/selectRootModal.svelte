<script lang="ts">
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { iconPath } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { VCSDetectionType, type Models } from '@appwrite.io/console';
    import { DirectoryPicker } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    type Directory = {
        title: string;
        fullPath: string;
        fileCount: number;
        thumbnailUrl: string;
        children?: Directory[];
        loading?: boolean;
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
            children: [],
            loading: false
        }
    ];
    let currentPath: string = './';
    let currentDir: Directory;
    export let expanded = writable(['lib-0', 'tree-0']);

    onMount(async () => {
        try {
            const content = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.getRepositoryContents($installation.$id, $repository.id, currentPath);
            // console.log(content);
            directories[0].fileCount = content.contents?.length ?? 0;
            directories[0].children = content.contents
                .filter((e) => e.isDirectory)
                .map((dir) => ({
                    title: dir.name,
                    fullPath: currentPath + dir.name,
                    fileCount: undefined,
                    thumbnailUrl: dir.name,
                    loading: false
                }));
            currentDir = directories[0];
            // console.log(directories);
            isLoading = false;
        } catch (e) {
            console.log(e);
        }
    });

    async function fetchContents(e: CustomEvent) {
        const path = e.detail.fullPath as string;
        currentPath = path;

        const pathSegments = path.split('/').filter((segment) => segment !== '.' && segment !== '');
        let traversedDir = directories[0]; // Start at root

        for (const segment of pathSegments) {
            const nextDir = traversedDir.children?.find((dir) => dir.title === segment);
            if (!nextDir) break;
            traversedDir = nextDir;
        }

        currentDir = traversedDir;

        if (!currentDir.fileCount) {
            currentDir.loading = true;
            directories = [...directories];

            try {
                const content = await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.getRepositoryContents($installation.$id, $repository.id, path);
                // console.log(content);
                const fileCount = content.contents?.length ?? 0;
                const contentDirectories = content.contents.filter((e) => e.isDirectory);

                if (contentDirectories.length === 0) {
                    return;
                }

                currentDir.fileCount = fileCount;
                currentDir.children = contentDirectories.map((dir) => ({
                    title: dir.name,
                    fullPath: path + '/' + dir.name,
                    fileCount: undefined,
                    thumbnailUrl: undefined
                }));
                const runtime = await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.createRepositoryDetection(
                        $installation.$id,
                        $repository.id,
                        product === 'sites' ? VCSDetectionType.Framework : VCSDetectionType.Runtime,
                        path
                    );
                if (product === 'sites') {
                    currentDir.children.forEach((dir) => {
                        dir.thumbnailUrl = $iconPath(runtime.framework, 'color');
                    });
                } else if (product === 'functions') {
                    currentDir.children.forEach((dir) => {
                        dir.thumbnailUrl = $iconPath(
                            (runtime as unknown as Models.DetectionRuntime).runtime,
                            'color'
                        );
                    });
                }
                directories = [...directories];
                $expanded = [...$expanded, path];
            } catch (error) {
                console.error(error);
            } finally {
                currentDir.loading = false;
            }
        }
    }

    function handleSubmit() {
        rootDir = currentPath;
        show = false;
    }
</script>

<Modal title="Root directory" bind:show onSubmit={handleSubmit}>
    <span slot="description">
        Select the directory where your site code is located using the menu below.
    </span>
    <DirectoryPicker {directories} {isLoading} on:select={fetchContents} bind:expanded />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isLoading}>Save</Button>
    </svelte:fragment>
</Modal>
