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

    type ProjectAccess = { projectId: string; roleName: string };
    type Option = { value: string; label: string };

    let {
        projectAccess = $bindable<ProjectAccess[]>([])
    }: {
        projectAccess: ProjectAccess[];
    } = $props();

    // Per-row options and loading state
    let rowOptions = $state<Option[][]>([]);
    let rowSearching = $state<boolean[]>([]);

    function takenIds(excludeIndex: number): Set<string> {
        return new Set(
            projectAccess
                .filter((_, i) => i !== excludeIndex)
                .map((a) => a.projectId)
                .filter(Boolean)
        );
    }

    async function loadProjects(index: number, search = '') {
        rowSearching[index] = true;
        const queries: string[] = [
            Query.limit(25),
            Query.equal('teamId', $organization.$id)
        ];
        if (search) {
            queries.push(Query.search('name', search));
        }

        const result = await sdk.forConsole
            .organization($organization.$id)
            .listProjects({ queries })
            .catch(() => null);

        const taken = takenIds(index);
        rowOptions[index] = (result?.projects ?? [])
            .filter((p) => !taken.has(p.$id))
            .map((p) => ({ value: p.$id, label: p.name }));
        rowSearching[index] = false;
    }

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
        debouncedSearchers.delete(i);
    }

</script>

<Layout.Stack gap="s">
    {#each projectAccess as access, i}
        <Layout.Stack direction="row" gap="s" alignItems="flex-end">
            <div style:flex="1">
                <Input.ComboBox
                    id="project-{i}"
                    label={i === 0 ? 'Project' : ''}
                    required
                    placeholder="Search projects"
                    bind:value={access.projectId}
                    options={rowOptions[i] ?? []}
                    noResultsOption={rowSearching[i] ? { disabled: true, message: 'Searching...' } : undefined}
                    on:search={(e) => getDebouncedSearch(i)(e.detail)}
                    on:focus={() => { if (!rowOptions[i]?.length) loadProjects(i); }} />
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
