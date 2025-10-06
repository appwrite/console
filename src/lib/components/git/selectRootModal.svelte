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
    export let branch: string;

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
    export let expanded = writable([]);
    let initialized = false;
    let initialPath: string = './';
    let pathNotFound = false;

    onMount(async () => {
        try {
            const content = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.getRepositoryContents({
                    installationId: $installation.$id,
                    providerRepositoryId: $repository.id,
                    providerRootDirectory: currentPath,
                    providerReference: branch
                });
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
            isLoading = false;
            $expanded = Array.from(new Set([...$expanded, './']));
        } catch {
            return;
        }
    });

    async function loadPath(path: string) {
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
                    .vcs.getRepositoryContents({
                        installationId: $installation.$id,
                        providerRepositoryId: $repository.id,
                        providerRootDirectory: path,
                        providerReference: branch
                    });

                const fileCount = content.contents?.length ?? 0;
                const contentDirectories = content.contents.filter((e) => e.isDirectory);

                if (contentDirectories.length === 0) {
                    $expanded = Array.from(new Set([...$expanded, path]));
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
                    .vcs.createRepositoryDetection({
                        installationId: $installation.$id,
                        providerRepositoryId: $repository.id,
                        type:
                            product === 'sites'
                                ? VCSDetectionType.Framework
                                : VCSDetectionType.Runtime,
                        providerRootDirectory: path
                    });
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
                $expanded = Array.from(new Set([...$expanded, path]));
            } catch (error) {
                console.error(error);
            } finally {
                currentDir.loading = false;
            }
        }
    }

    async function fetchContents(e: CustomEvent) {
        const path = e.detail.fullPath as string;
        await loadPath(path);
    }

    function normalizePath(path: string): string {
        if (!path || path === '') return './';
        if (path === './') return './';
        if (path.startsWith('./')) return path.replace(/\/$/, '');
        if (path.startsWith('/')) return '.' + path.replace(/\/$/, '');
        return './' + path.replace(/\/$/, '');
    }

    async function expandToPath(path: string) {
        pathNotFound = false;
        const normalized = normalizePath(path);
        const segments = normalized.split('/').filter((s) => s !== '.' && s !== '');
        let cumulative = './';
        $expanded = Array.from(new Set([...$expanded, './']));
        for (const segment of segments) {
            cumulative = cumulative === './' ? `./${segment}` : `${cumulative}/${segment}`;
            const parentSegments = cumulative.split('/').filter((s) => s !== '.' && s !== '');
            let cursor = directories[0];
            for (const s of parentSegments.slice(0, -1)) {
                const next = cursor.children?.find((d) => d.title === s);
                if (!next) {
                    pathNotFound = true;
                    return;
                }
                cursor = next;
            }
            await loadPath(cursor.fullPath ?? './');
            const exists = cursor.children?.some((d) => d.title === segment);
            if (!exists) {
                pathNotFound = true;
                return;
            }
            $expanded = Array.from(new Set([...$expanded, cumulative]));
        }
        currentPath = normalized;
    }

    $: if (show && !initialized && !isLoading) {
        initialized = true;
        initialPath = normalizePath(rootDir ?? './');
        currentPath = initialPath;
        expandToPath(initialPath);
    }

    $: if (!show && initialized) {
        initialized = false;
        pathNotFound = false;
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
        <Button submit disabled={isLoading || currentPath === initialPath}>Save</Button>
    </svelte:fragment>
</Modal>
