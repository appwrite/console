<script lang="ts">
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { iconPath } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { VCSDetectionType, type Models } from '@appwrite.io/console';
    import DirectoryPicker from '$lib/components/git/DirectoryPicker.svelte';
    import InstallationError from '$lib/components/git/installationError.svelte';
    import {
        getVcsInstallationErrorKind,
        type VcsInstallationErrorKind
    } from '$lib/helpers/vcsError';
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
    /**
     * Reading the tree goes through the installation token, so a dead token
     * surfaces here as a failed contents call. Left unhandled the picker either
     * sits on its spinner forever or renders an empty tree, both of which read
     * as "this repository has no directories".
     */
    let installationErrorKind = $state<VcsInstallationErrorKind | null>(null);
    /** Whether the root listing ever succeeded, so the tree has something real in it. */
    let loadedRoot = $state(false);
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
    let expandedPaths = $state<string[]>([]);
    const expandedStore = writable<string[]>([]);

    $effect(() => {
        expandedStore.set(expandedPaths);
    });
    $effect(() => {
        const unsub = expandedStore.subscribe((v) => {
            expandedPaths = v;
        });
        return unsub;
    });

    let initialized = $state(false);
    let initialPath = $state('/');
    const inFlightPaths = new Set<string>();
    const contentsCache = new Map<
        string,
        { fileCount: number; directories: Array<{ name: string }> }
    >();
    const iconCache = new Map<string, string | null>();

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
            if (iconCache.has(path)) {
                return iconCache.get(path) ?? null;
            }
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
                    ? (detection as unknown as Models.DetectionFramework).framework
                    : (detection as unknown as Models.DetectionRuntime).runtime;
            const resolved = resolveIconUrl(iconName);
            iconCache.set(path, resolved);
            return resolved;
        } catch (err) {
            iconCache.set(path, null);
            return null;
        }
    }

    async function detectIconsForChildren(parentPath: string) {
        const targetDir = getDirByPath(parentPath);
        if (!targetDir?.children?.length) return;

        const children = targetDir.children;
        const concurrency = 3;
        let index = 0;

        async function worker() {
            while (index < children.length) {
                const current = index;
                index += 1;
                const child = children[current];
                const icon = await detectRuntimeOrFramework(child.fullPath);
                if (icon && icon !== child.thumbnailUrl) {
                    child.thumbnailUrl = icon;
                }
            }
        }

        await Promise.all(Array.from({ length: Math.min(concurrency, children.length) }, worker));
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

        const contents = content.contents ?? [];
        const fileCount = contents.length;
        const directories = contents
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
            try {
                const { fileCount, directories } = await fetchContents(pathToLoad);
                const targetDir = getDirByPath(pathToLoad);
                if (targetDir) {
                    targetDir.fileCount = fileCount;
                }
                ensureChildren(pathToLoad, directories);
            } catch (error) {
                const kind = getVcsInstallationErrorKind(error);
                if (!kind) throw error;
                // Every remaining segment goes through the same installation,
                // so stop rather than firing a request per level that is
                // already known to fail.
                installationErrorKind = kind;
                return;
            }
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

                installationErrorKind = null;
                loadedRoot = true;
                isLoading = false;
                expandedPaths = [...new Set([...expandedPaths, '/'])];
                prefetchPath(rootDir || '/');
                detectIconsForChildren('/');
            } catch (error) {
                installationErrorKind = getVcsInstallationErrorKind(error);
                if (!installationErrorKind) {
                    console.error('Failed to load root directory:', error);
                }
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
        // skip loading if this directory was done
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
                expandedPaths = [...new Set([...expandedPaths, path])];
                return;
            }

            targetDir.fileCount = fileCount;

            // set logo only for the current folder, not for the children
            const detectedIcon = await detectRuntimeOrFramework(path);
            if (detectedIcon) {
                targetDir.thumbnailUrl = detectedIcon;
            }

            ensureChildren(path, contentDirectories);
            detectIconsForChildren(path);

            expandedPaths = [...new Set([...expandedPaths, path])];
        } catch (error) {
            const kind = getVcsInstallationErrorKind(error);
            if (kind) {
                installationErrorKind = kind;
            } else {
                console.error('Failed to load directory:', error);
            }
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
        let walkPath = '/';

        for (const segment of segments) {
            walkPath = walkPath === '/' ? `/${segment}` : `${walkPath}/${segment}`;
            pathsToExpand.push(walkPath);

            if (!currentDir.children) {
                currentDir.children = [];
            }

            let nextDir = currentDir.children.find((d) => d.title === segment);
            if (!nextDir) {
                nextDir = {
                    title: segment,
                    fullPath: walkPath,
                    fileCount: undefined,
                    thumbnailUrl: $iconPath('empty', 'grayscale'),
                    children: [],
                    hasChildren: true
                };
                currentDir.children = [...currentDir.children, nextDir];
            }

            currentDir = nextDir;
        }

        expandedPaths = [...new Set([...expandedPaths, ...pathsToExpand])];

        // ensure each segment loads in order so deeper children appear
        for (const pathToLoad of pathsToExpand) {
            // eslint-disable-next-line no-await-in-loop
            await loadPath(pathToLoad);
        }

        currentPath = normalized;
    }

    $effect(() => {
        // `loadedRoot` gates this: without a real tree, expanding walks paths
        // that are not there and fires one doomed request per segment.
        if (show && !initialized && !isLoading && loadedRoot) {
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

    function handleSelect(detail: { fullPath: string }) {
        loadPath(detail.fullPath);
    }

    function retryLoad() {
        installationErrorKind = null;
        if (loadedRoot) {
            // Only a deeper directory failed, so the tree is still usable.
            loadPath(currentPath);
            return;
        }
        // Re-runs the root effect, the only thing that can populate the tree.
        initialized = false;
        isLoading = true;
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
    {#if installationErrorKind}
        <InstallationError
            kind={installationErrorKind}
            provider={$installation?.provider}
            organization={$installation?.organization}
            onRetry={retryLoad} />
    {/if}
    {#if loadedRoot || !installationErrorKind}
        <DirectoryPicker
            {directories}
            {isLoading}
            expanded={expandedStore}
            bind:selected={currentPath}
            openTo={initialPath}
            onSelect={handleSelect} />
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={isLoading || !hasChanges || !loadedRoot}>Save</Button>
    </svelte:fragment>
</Modal>
