<script lang="ts">
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { iconPath } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { VCSDetectionType, type Models } from '@appwrite.io/console';
    import DirectoryPicker from '$lib/components/git/DirectoryPicker.svelte';
    import { writable } from 'svelte/store';

    type Directory = {
        title: string;
        fullPath: string;
        fileCount?: number;
        thumbnailUrl?: string;
        children?: Directory[];
        hasChildren?: boolean;
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
            title: 'Repository (root)',
            fullPath: '/',
            fileCount: undefined,
            thumbnailUrl: $iconPath('empty', 'grayscale'),
            children: [],
            hasChildren: true,
            loading: false
        }
    ]);
    let currentPath = $state('/');
    let expandedStore = writable<string[]>([]);
    let initialized = $state(false);
    let initialPath = $state('/');
    const inFlightPaths = new Set<string>();
    const contentsCache = new Map<
        string,
        { fileCount: number; directories: Array<{ name: string }> }
    >();

    let hasChanges = $derived(currentPath !== initialPath);

    const iconAliases = new Map([
        ['svelte-kit', 'svelte'],
        ['sveltekit', 'svelte'],
        ['svelte_kit', 'svelte'],
        ['sveltejs', 'svelte'],
        ['other', 'empty']
    ]);

    function normalizePath(path: string): string {
        if (!path || path === './' || path === '/') return '/';
        const trimmed = path.replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/$/, '');
        return `/${trimmed}`;
    }

    function toProviderPath(path: string): string {
        const normalized = normalizePath(path);
        if (normalized === '/') return './';
        return `./${normalized.slice(1)}`;
    }

    function resolveIconUrl(rawIconName: string | null | undefined): string | null {
        if (!rawIconName) return null;
        const normalized = rawIconName.toLowerCase();
        const iconName = iconAliases.get(normalized) ?? normalized;
        return $iconPath(iconName, 'color');
    }

    async function detectRuntimeOrFramework(path: string): Promise<string | null> {
        try {
            const detection = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.createRepositoryDetection({
                    installationId: $installation.$id,
                    providerRepositoryId: $repository.id,
                    type:
                        product === 'sites' ? VCSDetectionType.Framework : VCSDetectionType.Runtime,
                    providerRootDirectory: toProviderPath(path)
                });

            const iconName =
                product === 'sites'
                    ? detection.framework
                    : (detection as unknown as Models.DetectionRuntime).runtime;
            return resolveIconUrl(iconName);
        } catch (err) {
            return null;
        }
    }

    async function fetchContents(path: string) {
        const cached = contentsCache.get(path);
        if (cached) return cached;

        const content = await sdk
            .forProject(page.params.region, page.params.project)
            .vcs.getRepositoryContents({
                installationId: $installation.$id,
                providerRepositoryId: $repository.id,
                providerRootDirectory: toProviderPath(path),
                providerReference: branch
            });

        const fileCount = content.contents?.length ?? 0;
        const directories = content.contents
            .filter((e) => e.isDirectory)
            .map((dir) => ({ name: dir.name }));

        const result = { fileCount, directories };
        contentsCache.set(path, result);
        return result;
    }

    function ensureChildren(path: string, directories: Array<{ name: string }>) {
        const targetDir = getDirByPath(path);
        if (!targetDir) return;

        if (directories.length === 0) {
            targetDir.hasChildren = false;
            targetDir.children = [];
            return;
        }

        const existingByTitle = new Map(
            (targetDir.children ?? []).map((child) => [child.title, child])
        );
        targetDir.children = directories.map((dir) => {
            const fullPath = path === '/' ? `/${dir.name}` : `${path}/${dir.name}`;
            const existing = existingByTitle.get(dir.name);
            if (existing) {
                existing.fullPath = fullPath;
                existing.hasChildren = true;
                existing.loading = existing.loading ?? false;
                existing.thumbnailUrl = existing.thumbnailUrl ?? $iconPath('empty', 'grayscale');
                existing.children = existing.children ?? [];
                return existing;
            }
            return {
                title: dir.name,
                fullPath,
                fileCount: undefined,
                thumbnailUrl: $iconPath('empty', 'grayscale'),
                children: [],
                hasChildren: true,
                loading: false
            };
        });
    }

    async function prefetchPath(path: string) {
        const normalized = normalizePath(path);
        const segments = normalized.split('/').filter((s) => s !== '');
        const pathsToLoad = ['/'];
        let currentPath = '/';

        for (const segment of segments) {
            currentPath = currentPath === '/' ? `/${segment}` : `${currentPath}/${segment}`;
            pathsToLoad.push(currentPath);
        }

        for (const pathToLoad of pathsToLoad) {
            const { fileCount, directories } = await fetchContents(pathToLoad);
            const targetDir = getDirByPath(pathToLoad);
            if (targetDir) {
                targetDir.fileCount = fileCount;
            }
            ensureChildren(pathToLoad, directories);
        }
    }

    $effect(() => {
        if (!isLoading) return;

        (async () => {
            try {
                const content = await fetchContents('/');

                const repoTitle = $repository?.name
                    ? `${$repository.name} (root)`
                    : 'Repository (root)';

                directories[0] = {
                    ...directories[0],
                    title: repoTitle,
                    fileCount: content.fileCount
                };
                ensureChildren('/', content.directories);

                const detectedIcon = await detectRuntimeOrFramework('/');
                if (detectedIcon) {
                    directories[0].thumbnailUrl = detectedIcon;
                }

                isLoading = false;
                expandedStore.update((exp) => [...new Set([...exp, '/'])]);
                prefetchPath(rootDir || '/');
            } catch (error) {
                console.error('Failed to load root directory:', error);
                isLoading = false;
            }
        })();
    });

    function getDirByPath(path: string): Directory | null {
        const segments = path.split('/').filter((s) => s !== '');
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

        if (!targetDir.children) {
            targetDir.children = [];
        }

        if (inFlightPaths.has(path)) return;
        inFlightPaths.add(path);
        targetDir.loading = true;

        try {
            const { fileCount, directories: contentDirectories } = await fetchContents(path);

            if (contentDirectories.length === 0) {
                targetDir.hasChildren = false;
                targetDir.children = [];
                expandedStore.update((exp) => [...new Set([...exp, path])]);
                return;
            }

            targetDir.fileCount = fileCount;

            // set logo only for the current folder, not for the children
            const detectedIcon = await detectRuntimeOrFramework(path);
            if (detectedIcon) {
                targetDir.thumbnailUrl = detectedIcon;
            }

            ensureChildren(path, contentDirectories);

            expandedStore.update((exp) => [...new Set([...exp, path])]);
        } catch (error) {
            console.error('Failed to load directory:', error);
        } finally {
            targetDir.loading = false;
            inFlightPaths.delete(path);
        }
    }

    async function expandToPath(path: string) {
        const normalized = normalizePath(path);
        const segments = normalized.split('/').filter((s) => s !== '');

        const pathsToExpand = ['/'];

        let currentDir = directories[0];
        let currentPath = '/';

        for (const segment of segments) {
            currentPath = currentPath === '/' ? `/${segment}` : `${currentPath}/${segment}`;
            pathsToExpand.push(currentPath);

            if (!currentDir.children) {
                currentDir.children = [];
            }

            let nextDir = currentDir.children.find((d) => d.title === segment);
            if (!nextDir) {
                nextDir = {
                    title: segment,
                    fullPath: currentPath,
                    fileCount: undefined,
                    thumbnailUrl: $iconPath('empty', 'grayscale'),
                    children: [],
                    hasChildren: true
                };
                currentDir.children = [...currentDir.children, nextDir];
            }

            currentDir = nextDir;
        }

        expandedStore.update((exp) => [...new Set([...exp, ...pathsToExpand])]);

        // ensure each segment loads in order so deeper children appear
        for (const pathToLoad of pathsToExpand) {
            // eslint-disable-next-line no-await-in-loop
            await loadPath(pathToLoad);
        }

        currentPath = normalized;
    }

    $effect(() => {
        if (show && !initialized && !isLoading) {
            initialized = true;
            const normalized = normalizePath(rootDir || '/');
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

    async function handleSelect(detail: { fullPath: string }) {
        const path = detail.fullPath as string;
        currentPath = path;
        loadPath(path);
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
        bind:expanded={expandedStore}
        bind:selected={currentPath}
        openTo={initialPath}
        onSelect={handleSelect}
        onChange={handleSelect} />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isLoading || !hasChanges}>Save</Button>
    </svelte:fragment>
</Modal>
