<script lang="ts" context="module">
    const compatPairs = [
        { newer: 'tables.', legacy: 'collections.' },
        { newer: 'columns.', legacy: 'attributes.' },
        { newer: 'rows.', legacy: 'documents.' }
    ] as const;

    export function getEffectiveScopes(scopes: string[]): string[] {
        const effectiveScopes = new Set<string>();

        for (const scope of scopes) {
            let effectiveScope = scope;

            for (const pair of compatPairs) {
                if (scope.startsWith(pair.legacy)) {
                    effectiveScope = scope.replace(pair.legacy, pair.newer);
                    break;
                }
            }

            effectiveScopes.add(effectiveScope);
        }

        return Array.from(effectiveScopes);
    }
</script>

<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { scopes as allScopes } from '$lib/constants';
    import { onMount } from 'svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Accordion, Divider, Layout, Selector } from '@appwrite.io/pink-svelte';

    export let scopes: string[];

    const scopeCatalog = new Set(allScopes.map((s) => s.scope));

    const filteredScopes = allScopes.filter((scope) => {
        const val = scope.scope;
        if (!val) return false;

        const legacyPrefixes = ['collections.', 'attributes.', 'documents.'];
        return !legacyPrefixes.some((prefix) => val.startsWith(prefix));
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

    const activeScopes = filteredScopes.reduce((prev, next) => {
        prev[next.scope] = false;
        return prev;
    }, {});

    onMount(() => {
        scopes.forEach((scope) => {
            const newerScope = toNewerScope(scope);
            if (newerScope in activeScopes) {
                activeScopes[newerScope] = true;
            }
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

    function toNewerScope(scope: string): string {
        for (const pair of compatPairs) {
            if (scope.startsWith(pair.legacy)) {
                return scope.replace(pair.legacy, pair.newer);
            }
        }
        return scope;
    }

    function getAllScopeVariants(scope: string): string[] {
        const variants = new Set([scope]);

        for (const pair of compatPairs) {
            if (scope.startsWith(pair.newer)) {
                variants.add(scope.replace(pair.newer, pair.legacy));
            } else if (scope.startsWith(pair.legacy)) {
                variants.add(scope.replace(pair.legacy, pair.newer));
            }
        }

        return Array.from(variants);
    }

    function categoryState(category: string, s: string[]): boolean | 'indeterminate' {
        const scopesByCategory = filteredScopes.filter((n) => n.category === category);

        const activeInCategory = scopesByCategory.filter((scopeItem) => {
            const newerScope = scopeItem.scope;
            return s.some((scope) => toNewerScope(scope) === newerScope);
        });

        if (activeInCategory.length === 0) {
            return false;
        } else if (activeInCategory.length === scopesByCategory.length) {
            return true;
        }

        return 'indeterminate';
    }

    function onCategoryChange(event: CustomEvent<boolean | 'indeterminate'>, category: Category) {
        if (event.detail === 'indeterminate') return;
        filteredScopes.forEach((s) => {
            if (s.category === category) {
                activeScopes[s.scope] = event.detail;
            }
        });
    }

    function generateSyncedScopes(activeScopesObj: Record<string, boolean>): string[] {
        const result = new Set<string>();

        Object.entries(activeScopesObj).forEach(([scope, isActive]) => {
            if (isActive) {
                const variants = getAllScopeVariants(scope);
                variants.forEach((variant) => {
                    if (scopeCatalog.has(variant)) {
                        result.add(variant);
                    }
                });
            }
        });

        return Array.from(result);
    }

    $: {
        if (mounted) {
            const newScopes = generateSyncedScopes(activeScopes);

            if (symmetricDifference(scopes, newScopes).length) {
                scopes = newScopes;
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
                (n) =>
                    n.category === category &&
                    scopes.some((scope) => toNewerScope(scope) === n.scope)
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
