<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { scopes as allScopes } from '$lib/constants';
    import { onMount } from 'svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Accordion, Divider, Layout, Selector } from '@appwrite.io/pink-svelte';

    export let scopes: string[];

    const newScopes = ['tables.', 'columns.', 'rows.'];
    const legacyScopes = ['attributes.', 'collections.', 'documents.'];

    const isCreateMode = scopes.length === 0;

    const hasLegacyScopes = !isCreateMode
        ? scopes.some((scope) => legacyScopes.some((prefix) => scope?.startsWith(prefix)))
        : false;

    const filteredScopes = allScopes.filter((scope) => {
        const val = scope.scope;

        if (!val) return false;

        if (isCreateMode) {
            return !legacyScopes.some((prefix) => val.startsWith(prefix));
        }

        if (hasLegacyScopes) {
            // In edit mode, if legacy scopes exist, exclude new ones
            return !newScopes.some((prefix) => val.startsWith(prefix));
        } else {
            // In edit mode, if new scopes exist, exclude new ones
            return !legacyScopes.some((prefix) => val.startsWith(prefix));
        }
    });

    enum Category {
        Auth = 'Auth',
        Database = 'Database',
        Functions = 'Functions',
        Messaging = 'Messaging',
        Sites = 'Sites',
        Storage = 'Storage',
        Other = 'Other'
    }

    const categories = [
        Category.Auth,
        Category.Database,
        Category.Functions,
        Category.Storage,
        Category.Messaging,
        Category.Sites,
        Category.Other
    ];

    let mounted = false;

    onMount(() => {
        scopes.forEach((scope) => {
            activeScopes[scope] = true;
        });

        mounted = true;
    });

    function selectAll() {
        for (const scope in activeScopes) {
            activeScopes[scope] = true;
        }
    }

    function deselectAll() {
        for (const scope in activeScopes) {
            activeScopes[scope] = false;
        }
    }

    function categoryState(category: string, s: string[]): boolean | 'indeterminate' {
        const scopesByCategory = filteredScopes.filter((n) => n.category === category);
        const filtered = scopesByCategory.filter((n) => s.includes(n.scope));
        if (filtered.length === 0) {
            return false;
        } else if (filtered.length === scopesByCategory.length) {
            return true;
        } else {
            return 'indeterminate';
        }
    }

    function onCategoryChange(event: CustomEvent<boolean | 'indeterminate'>, category: Category) {
        if (event.detail === 'indeterminate') return;
        filteredScopes.forEach((s) => {
            if (s.category === category) {
                activeScopes[s.scope] = event.detail;
            }
        });
    }

    const activeScopes = filteredScopes.reduce((prev, next) => {
        prev[next.scope] = false;

        return prev;
    }, {});

    $: {
        if (mounted) {
            const newScopeSet = filteredScopes
                .filter((scope) => activeScopes[scope.scope])
                .map(({ scope }) => scope);

            if (symmetricDifference(scopes, newScopeSet).length) {
                scopes = newScopeSet;
            }
        }
    }
</script>

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Button compact on:click={selectAll}>Select all</Button>
        <span style:height="20px">
            <Divider vertical />
        </span>
        <Button compact on:click={deselectAll}>Deselect all</Button>
    </Layout.Stack>
    <Layout.Stack gap="none">
        <Divider />

        {#each categories as category, index}
            {@const checked = categoryState(category, scopes)}
            {@const isLastItem = index === categories.length - 1}
            {@const scopesLength = filteredScopes.filter(
                (n) => n.category === category && scopes.includes(n.scope)
            ).length}
            <Accordion
                selectable
                title={category}
                hideDivider={isLastItem}
                badge={`${scopesLength} ${scopesLength === 1 ? 'Scope' : 'Scopes'}`}
                {checked}
                on:change={(event) => onCategoryChange(event, category)}>
                <Layout.Stack>
                    {#each filteredScopes.filter((s) => s.category === category) as scope}
                        <Selector.Checkbox
                            size="s"
                            id={scope.scope}
                            label={scope.scope}
                            description={scope.description}
                            bind:checked={activeScopes[scope.scope]} />
                    {/each}
                </Layout.Stack>
            </Accordion>
        {/each}
    </Layout.Stack>
</Layout.Stack>
