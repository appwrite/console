<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { projectRoles } from '$lib/stores/billing';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { Query } from '@appwrite.io/console';
    import { Icon, Layout, Input } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import { debounce } from '$lib/helpers/debounce';
    import { onMount } from 'svelte';

    type ProjectAccess = { projectId: string; roleName: string };
    type Option = { value: string; label: string };

    let {
        projectAccess = $bindable<ProjectAccess[]>([])
    }: {
        projectAccess: ProjectAccess[];
    } = $props();

    // Per-row options, loading state, and request-generation counters
    let rowOptions = $state<Option[][]>([]);
    let rowSearching = $state<boolean[]>([]);
    // Incremented on every loadProjects call for a row; the response is
    // discarded if a newer request has already been dispatched.
    let rowGeneration = $state<number[]>([]);

    // Prefetch the first page the moment this component mounts (i.e. when the
    // user switches to "Specific projects") so results are ready or in-flight
    // before any row is opened.  All rows share this single Promise for
    // unfiltered loads; typed searches always hit the API separately.
    let prefetchPromise: Promise<Option[]> | null = null;

    onMount(() => {
        prefetchPromise = sdk.forConsole
            .organization($organization.$id)
            .listProjects({
                queries: [
                    Query.limit(25),
                    Query.orderDesc(''),
                    Query.equal('teamId', $organization.$id)
                ]
            })
            .then((r) => r.projects.map((p) => ({ value: p.$id, label: p.name })))
            .catch(() => []);
    });

    function takenIds(excludeIndex: number): Set<string> {
        return new Set(
            projectAccess
                .filter((_, i) => i !== excludeIndex)
                .map((a) => a.projectId)
                .filter(Boolean)
        );
    }

    async function loadProjects(index: number, search = '') {
        const gen = (rowGeneration[index] ?? 0) + 1;
        rowGeneration[index] = gen;
        rowSearching[index] = true;

        let allOptions: Option[];
        if (!search && prefetchPromise) {
            // Re-use the shared prefetch — avoids a redundant network request
            allOptions = await prefetchPromise;
        } else {
            const queries: string[] = [
                Query.limit(25),
                Query.orderDesc(''),
                Query.equal('teamId', $organization.$id)
            ];
            if (search) queries.push(Query.search('name', search));
            const result = await sdk.forConsole
                .organization($organization.$id)
                .listProjects({ queries })
                .catch(() => null);
            allOptions = (result?.projects ?? []).map((p) => ({ value: p.$id, label: p.name }));
        }

        // Discard stale responses — a newer request has already been dispatched
        if (rowGeneration[index] !== gen) return;

        const taken = takenIds(index);
        rowOptions[index] = allOptions.filter((p) => !taken.has(p.value));
        rowSearching[index] = false;
    }

    // When the component is initialised with pre-existing rows (edit mode),
    // options must be loaded eagerly so the ComboBox can resolve the project
    // name from the stored projectId instead of showing the raw UUID.
    $effect(() => {
        projectAccess.forEach((access, i) => {
            if (access.projectId && !rowOptions[i]?.length && !rowSearching[i]) {
                loadProjects(i);
            }
        });
    });

    // One debounced searcher per row — created on demand
    const debouncedSearchers = new Map<number, (search: string) => void>();
    function getDebouncedSearch(index: number) {
        if (!debouncedSearchers.has(index)) {
            debouncedSearchers.set(
                index,
                debounce((search: string) => loadProjects(index, search), 300)
            );
        }
        return debouncedSearchers.get(index)!;
    }

    function addRow() {
        const index = projectAccess.length;
        projectAccess = [...projectAccess, { projectId: '', roleName: 'developer' }];
        loadProjects(index);
    }

    function removeRow(i: number) {
        projectAccess = projectAccess.filter((_, idx) => idx !== i);
        rowOptions = rowOptions.filter((_, idx) => idx !== i);
        rowSearching = rowSearching.filter((_, idx) => idx !== i);
        rowGeneration = rowGeneration.filter((_, idx) => idx !== i);
        debouncedSearchers.delete(i);
        // The removed row's project is no longer taken — invalidate sibling caches
        // so they reload with the freed-up project available again.
        rowOptions = rowOptions.map(() => []);
    }

    // When a project is selected in one row, the other rows' cached option lists
    // are now stale (they still include the chosen project). Clear them so each
    // row reloads fresh options (filtered via takenIds) on next focus.
    function onProjectSelected(selectedIndex: number) {
        rowOptions = rowOptions.map((opts, i) => (i === selectedIndex ? opts : []));
    }
</script>

<Layout.Stack gap="s">
    {#each projectAccess as access, i}
        <Layout.Stack direction="row" gap="s" alignItems="flex-end">
            <div
                style:flex="1"
                onfocusin={() => {
                    if (!rowOptions[i]?.length) loadProjects(i);
                }}
                oninput={(e) => {
                    if (e.target instanceof HTMLInputElement) {
                        getDebouncedSearch(i)(e.target.value);
                    }
                }}>
                <Input.ComboBox
                    id="project-{i}"
                    label={i === 0 ? 'Project' : ''}
                    required
                    placeholder="Search projects"
                    bind:value={access.projectId}
                    options={rowOptions[i] ?? []}
                    noResultsOption={rowSearching[i]
                        ? { disabled: true, message: 'Searching...' }
                        : undefined}
                    on:change={() => onProjectSelected(i)} />
            </div>
            <div style:width="140px">
                <InputSelect
                    id="project-role-{i}"
                    label={i === 0 ? 'Role' : ''}
                    required
                    options={projectRoles}
                    bind:value={access.roleName} />
            </div>
            <div style:padding-bottom="2px">
                <Button text icon size="s" on:click={() => removeRow(i)}>
                    <Icon size="s" icon={IconTrash} />
                </Button>
            </div>
        </Layout.Stack>
    {/each}
    <div>
        <Button secondary size="s" on:click={addRow}>
            <Icon size="s" icon={IconPlus} slot="start" />
            Add project
        </Button>
    </div>
</Layout.Stack>
