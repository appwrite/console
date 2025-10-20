<script lang="ts">
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { iconPath } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { VCSDetectionType, type Models } from '@appwrite.io/console';
    import { DirectoryPicker } from '@appwrite.io/pink-svelte';
    import { writable } from 'svelte/store';

    type Directory = {
        title: string;
        fullPath: string;
        fileCount?: number;
        thumbnailUrl?: string;
        children?: Directory[];
        loading?: boolean;
    };

    let {
        show = $bindable(false),
        rootDir = $bindable(''),
        product = 'functions' as 'sites' | 'functions',
        branch
    }: {
        show?: boolean;
        rootDir?: string;
        product?: 'sites' | 'functions';
        branch: string;
    } = $props();

    let isLoading = $state(true);
    let directories = $state<Directory[]>([
        {
            title: 'Root',
            fullPath: './',
            fileCount: 0,
            thumbnailUrl: 'root',
            children: [],
            loading: false
        }
    ]);
    let currentPath = $state('./');
    let expandedStore = writable<string[]>([]);
    let initialized = $state(false);
    let initialPath = $state('./');
    let isFetching = false;

    let hasChanges = $derived(currentPath !== initialPath);

    async function detectRuntimeOrFramework(path: string): Promise<string | null> {
        try {
            const detection = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.createRepositoryDetection({
                    installationId: $installation.$id,
                    providerRepositoryId: $repository.id,
                    type:
                        product === 'sites' ? VCSDetectionType.Framework : VCSDetectionType.Runtime,
                    providerRootDirectory: path
                });

            const iconName =
                product === 'sites'
                    ? detection.framework
                    : (detection as unknown as Models.DetectionRuntime).runtime;
            return $iconPath(iconName, 'color');
        } catch (err) {
            return null;
        }
    }

    $effect(() => {
        if (!isLoading) return;

        (async () => {
            try {
                const content = await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.getRepositoryContents({
                        installationId: $installation.$id,
                        providerRepositoryId: $repository.id,
                        providerRootDirectory: './',
                        providerReference: branch
                    });

                directories[0] = {
                    ...directories[0],
                    fileCount: content.contents?.length ?? 0,
                    children: content.contents
                        .filter((e) => e.isDirectory)
                        .map((dir) => ({
                            title: dir.name,
                            fullPath: `./${dir.name}`,
                            fileCount: undefined,
                            // set logo for root directories
                            thumbnailUrl: dir.name,
                            loading: false
                        }))
                };

                const detectedIcon = await detectRuntimeOrFramework('./');
                if (detectedIcon) {
                    directories[0].thumbnailUrl = detectedIcon;
                }

                isLoading = false;
                expandedStore.update((exp) => [...exp, './']);
            } catch (error) {
                console.error('Failed to load root directory:', error);
                isLoading = false;
            }
        })();
    });

    function getDirByPath(path: string): Directory | null {
        const segments = path.split('/').filter((s) => s !== '.' && s !== '');
        let node: Directory | null = directories[0] ?? null;
        for (const seg of segments) {
            const next = node?.children?.find((d) => d.title === seg) ?? null;
            if (!next) return null;
            node = next;
        }
        return node;
    }

    async function loadPath(path: string) {
        // skip loading if this directory was donee
        const targetDir = getDirByPath(path);
        if (!targetDir || targetDir.fileCount !== undefined) return;

        if (isFetching) return;
        isFetching = true;
        targetDir.loading = true;

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
                expandedStore.update((exp) => [...new Set([...exp, path])]);
                return;
            }

            targetDir.fileCount = fileCount;

            // set logo only for the current folder, not for the children
            const detectedIcon = await detectRuntimeOrFramework(path);
            if (detectedIcon) {
                targetDir.thumbnailUrl = detectedIcon;
            }

            targetDir.children = contentDirectories.map((dir) => {
                return {
                    title: dir.name,
                    fullPath: `${path}/${dir.name}`,
                    fileCount: undefined,
                    thumbnailUrl: dir.name
                };
            });

            expandedStore.update((exp) => [...new Set([...exp, path])]);
        } catch (error) {
            console.error('Failed to load directory:', error);
        } finally {
            targetDir.loading = false;
            isFetching = false;
        }
    }

    function normalizePath(path: string): string {
        if (!path || path === './') return './';
        const trimmed = path.replace(/\/$/, '');
        return trimmed.startsWith('./') ? trimmed : `./${trimmed}`;
    }

    async function expandToPath(path: string) {
        const normalized = normalizePath(path);
        const segments = normalized.split('/').filter((s) => s !== '.' && s !== '');

        expandedStore.update((exp) => [...new Set([...exp, './'])]);

        let currentDir = directories[0];
        let currentPath = './';

        for (const segment of segments) {
            currentPath = currentPath === './' ? `./${segment}` : `${currentPath}/${segment}`;

            // Load the parent directory if not already loaded
            await loadPath(currentDir.fullPath);

            // Find the next directory
            const nextDir = currentDir.children?.find((d) => d.title === segment);
            if (!nextDir) return; // Path doesn't exist

            currentDir = nextDir;
            expandedStore.update((exp) => [...new Set([...exp, currentPath])]);
        }

        currentPath = normalized;
    }

    $effect(() => {
        if (show && !initialized && !isLoading) {
            initialized = true;
            const normalized = normalizePath(rootDir || './');
            initialPath = normalized;
            currentPath = normalized;
            expandToPath(normalized);
        }
    });

    // reset state when modal closes
    $effect(() => {
        if (!show && initialized) {
            initialized = false;
        }
    });

    async function handleSelect(e: CustomEvent) {
        const path = e.detail.fullPath as string;
        if (isFetching) return;

        currentPath = path;
        await loadPath(path);
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
    <DirectoryPicker
        {directories}
        {isLoading}
        expanded={expandedStore}
        bind:selected={currentPath}
        openTo={initialPath}
        on:select={handleSelect} />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isLoading || !hasChanges}>Save</Button>
    </svelte:fragment>
</Modal>
