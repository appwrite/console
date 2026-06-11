<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import { Query } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import { createEventDispatcher } from 'svelte';

    export let value = '';
    export let installationId: string;
    export let repositoryId: string;
    export let label = 'Production branch';
    export let placeholder = 'Select branch';

    const dispatch = createEventDispatcher();

    let branches: { label: string; value: string }[] = [];
    let loading = false;
    let searchTimer: ReturnType<typeof setTimeout>;

    $: installationId, repositoryId, (() => {
        branches = [];
        loadBranches();
    })();

    async function loadBranches() {
        if (loading || !installationId || !repositoryId) return;
        loading = true;
        try {
            const { branches: result } = await sdk
                .forProject(page.params.region, page.params.project)
                .vcs.listRepositoryBranches({
                    installationId,
                    providerRepositoryId: repositoryId,
                    queries: [Query.limit(100)]
                });
            branches = result.map((b) => ({ label: b.name, value: b.name }));
        } finally {
            loading = false;
        }
    }

    async function handleSearch(searchValue: string) {
        if (!searchValue) {
            loadBranches();
            return;
        }
        clearTimeout(searchTimer);
        searchTimer = setTimeout(async () => {
            try {
                const { branches: results } = await sdk
                    .forProject(page.params.region, page.params.project)
                    .vcs.listRepositoryBranches({
                        installationId,
                        providerRepositoryId: repositoryId,
                        search: searchValue,
                        queries: [Query.limit(100)]
                    });
                branches = results.map((b) => ({ label: b.name, value: b.name }));
            } catch {
                // keep existing branches on error
            }
        }, 300);
    }
</script>

<Input.ComboBox
    id="branch-selector"
    {label}
    {placeholder}
    required
    bind:value
    options={branches}
    noResultsOption={loading ? 'Loading...' : 'No branches found. Type to search.'}
    on:change={(e) => {
        value = e.detail;
        dispatch('select', e.detail);
    }}
    on:input={(e) => handleSearch(e.detail)} />
