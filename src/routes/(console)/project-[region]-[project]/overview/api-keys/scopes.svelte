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
    import {
        cloudOnlyBackupScopes,
        extraProjectScopeFallbacks,
        scopes as scopeFallbackCatalog,
        type ScopeDefinition
    } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { Accordion, Alert, Badge, Divider, Layout, Selector } from '@appwrite.io/pink-svelte';
    import type { Scopes } from '@appwrite.io/console';

    /** IDs injected after `databases.write` on cloud — strip from API merge to avoid duplicates. */
    const cloudBackupScopeIds = new Set(cloudOnlyBackupScopes.map((s) => s.scope));

    let { scopes = $bindable([]) }: { scopes: Scopes[] } = $props();

    let allScopesList: ScopeDefinition[] = $state([]);
    let mounted = $state(false);
    let loadError: string | null = $state(null);

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

    const SCOPE_CATEGORY_ALIASES: Record<string, Category> = {
        databases: Category.Database,
        database: Category.Database,
        authentication: Category.Auth,
        authentications: Category.Auth,
        auth: Category.Auth,
        user: Category.Auth,
        users: Category.Auth,
        storage: Category.Storage,
        storages: Category.Storage,
        function: Category.Functions,
        functions: Category.Functions,
        messaging: Category.Messaging,
        message: Category.Messaging,
        site: Category.Sites,
        sites: Category.Sites,
        scheduled: Category.Functions,
        schedules: Category.Functions,
        platform: Category.Other,
        platforms: Category.Other,
        misc: Category.Other,
        miscellaneous: Category.Other,
        general: Category.Other,
        billing: Category.Other,
        assistant: Category.Other,
        console: Category.Other
    };

    function normalizeScopeCategory(raw: string): Category {
        const trimmed = raw.trim();
        if ((Object.values(Category) as string[]).includes(trimmed)) {
            return trimmed as Category;
        }
        return SCOPE_CATEGORY_ALIASES[trimmed.toLowerCase()] ?? Category.Other;
    }

    function mergeScopesFromApi(apiScopes: Models.ConsoleKeyScope[]): ScopeDefinition[] {
        const apiById = new Map(apiScopes.map((s) => [s.$id, s]));
        const merged: ScopeDefinition[] = [];
        const seen = new Set<string>();

        const catalog = [...scopeFallbackCatalog, ...extraProjectScopeFallbacks];

        for (const fallback of catalog) {
            if (seen.has(fallback.scope)) continue;
            seen.add(fallback.scope);
            const api = apiById.get(fallback.scope);
            merged.push({
                scope: fallback.scope,
                description: api?.description ?? fallback.description,
                category: normalizeScopeCategory(api?.category ?? fallback.category),
                deprecated: api?.deprecated ?? fallback.deprecated ?? false,
                icon: fallback.icon
            });
        }

        for (const s of apiScopes) {
            if (seen.has(s.$id)) continue;
            if (isCloud && cloudBackupScopeIds.has(s.$id)) continue;
            seen.add(s.$id);
            merged.push({
                scope: s.$id,
                description: s.description,
                category: normalizeScopeCategory(s.category),
                deprecated: s.deprecated,
                icon: ''
            });
        }

        return merged;
    }

    function dedupeScopesOrdered(list: ScopeDefinition[]): ScopeDefinition[] {
        const seen = new Set<string>();
        const out: ScopeDefinition[] = [];
        for (const s of list) {
            if (seen.has(s.scope)) continue;
            seen.add(s.scope);
            out.push(s);
        }
        return out;
    }

    /** Non-deprecated first, then alphabetical — keeps legacy scopes (e.g. execution.*) at the end. */
    function sortScopesForDisplay(list: ScopeDefinition[]): ScopeDefinition[] {
        return [...list].sort((a, b) => {
            if (!!a.deprecated !== !!b.deprecated) return a.deprecated ? 1 : -1;
            return a.scope.localeCompare(b.scope);
        });
    }

    const filteredScopes = $derived.by(() => {
        let base =
            isCloud && allScopesList.length
                ? allScopesList.filter((s) => !cloudBackupScopeIds.has(s.scope))
                : allScopesList;
        const databasesWriteIndex = base.findIndex((s) => s.scope === 'databases.write');
        if (isCloud && databasesWriteIndex !== -1) {
            base = [
                ...base.slice(0, databasesWriteIndex + 1),
                ...cloudOnlyBackupScopes,
                ...base.slice(databasesWriteIndex + 1)
            ];
        }
        return dedupeScopesOrdered(base);
    });

    const scopeCatalog = $derived(new Set(filteredScopes.map((s) => s.scope)));

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
        try {
            const result = await sdk.forConsole.console.listProjectScopes();
            allScopesList = mergeScopesFromApi(result.scopes);

            for (const s of filteredScopes) {
                activeScopes[s.scope] = scopes.includes(s.scope as Scopes);
            }
            mounted = true;
        } catch (e) {
            loadError = e?.message ?? 'Failed to load available scopes.';
            // mounted intentionally stays false — the $effect guards on it,
            // so leaving it false prevents activeScopes = {} from overwriting
            // the parent-bound scopes prop with an empty array on fetch failure.
        }
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
    {#if loadError}
        <Alert.Inline status="error" title="Failed to load scopes">{loadError}</Alert.Inline>
    {/if}
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
                    {#each sortScopesForDisplay(filteredScopes.filter((s) => s.category === category)) as scope}
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
