<script lang="ts" module>
    const compatPairs = [
        { newer: 'tables.', legacy: 'collections.' },
        { newer: 'columns.', legacy: 'attributes.' },
        { newer: 'rows.', legacy: 'documents.' },
        { newer: 'executions.', legacy: 'execution.' }
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
    import { onMount } from 'svelte';
    import { isCloud } from '$lib/system';
    import { Button } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { cloudOnlyBackupScopes, type ScopeDefinition } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { Accordion, Badge, Divider, Layout, Selector } from '@appwrite.io/pink-svelte';
    import type { Scopes } from '@appwrite.io/console';

    let { scopes = $bindable([]) }: { scopes: Scopes[] } = $props();

    let allScopesList: ScopeDefinition[] = $state([]);
    let mounted = $state(false);

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

    const filteredScopes = $derived.by(() => {
        const databasesWriteIndex = allScopesList.findIndex((s) => s.scope === 'databases.write');
        if (isCloud && databasesWriteIndex !== -1) {
            return [
                ...allScopesList.slice(0, databasesWriteIndex + 1),
                ...cloudOnlyBackupScopes,
                ...allScopesList.slice(databasesWriteIndex + 1)
            ];
        }
        return allScopesList;
    });

    const scopeCatalog = $derived(
        new Set([
            ...filteredScopes.map((s) => s.scope),
            ...(isCloud ? cloudOnlyBackupScopes.map((s) => s.scope) : [])
        ])
    );

    let activeScopes: Record<string, boolean> = $state({});

    $effect(() => {
        if (mounted) {
            const newScopes = generateSyncedScopes(activeScopes);
            if (symmetricDifference(scopes, newScopes).length) {
                scopes = newScopes;
            }
        }
    });

    onMount(async () => {
        const result = await sdk.forConsole.console.listProjectScopes();
        allScopesList = result.scopes.map((s) => ({
            scope: s.$id,
            description: s.description,
            category: s.category,
            deprecated: s.deprecated,
            icon: ''
        }));

        for (const s of filteredScopes) {
            activeScopes[s.scope] = scopes.includes(s.scope as Scopes);
        }
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
        const activeInCategory = scopesByCategory.filter((scopeItem) =>
            s.includes(scopeItem.scope as Scopes)
        );

        if (activeInCategory.length === 0) {
            return false;
        } else if (activeInCategory.length === scopesByCategory.length) {
            return true;
        }

        return 'indeterminate';
    }

    function onCategoryChange(event: CustomEvent<boolean | 'indeterminate'>, category: Category) {
        const { detail } = event;
        if (detail === 'indeterminate') return;
        filteredScopes.forEach((s) => {
            if (s.category === category && !s.deprecated) {
                activeScopes[s.scope] = detail;
            }
        });
    }

    function generateSyncedScopes(activeScopesObj: Record<string, boolean>): Scopes[] {
        return Object.entries(activeScopesObj)
            .filter(([scope, isActive]) => isActive && scopeCatalog.has(scope))
            .map(([scope]) => scope as Scopes);
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
                (n) => n.category === category && scopes.includes(n.scope as Scopes)
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
                        <Layout.Stack direction="row" alignItems="center" gap="s">
                            <Selector.Checkbox
                                size="s"
                                id={scope.scope}
                                label={`${scope.scope}${scope.deprecated ? ' (Deprecated)' : ''}`}
                                description={scope.description}
                                bind:checked={activeScopes[scope.scope]} />
                            {#if scope.deprecated}
                                <Badge size="xs" variant="secondary" content="Deprecated" />
                            {/if}
                        </Layout.Stack>
                    {/each}
                </Layout.Stack>
            </Accordion>
        {/each}
    </Layout.Stack>
</Layout.Stack>
