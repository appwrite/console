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
        scopes as localScopes,
        type ScopeDefinition
    } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { Accordion, Alert, Badge, Divider, Layout, Selector } from '@appwrite.io/pink-svelte';
    import type { Scopes } from '@appwrite.io/console';

    let { scopes = $bindable([]) }: { scopes: Scopes[] } = $props();

    let allScopesList: ScopeDefinition[] = $state([]);
    let mounted = $state(false);
    let loadError: string | null = $state(null);
    const effectiveScopes = $derived(getEffectiveScopes(scopes));

    const categoryAliasMap: Record<string, string> = {
        Database: 'Databases'
    };

    function normalizeCategory(category: string): string {
        return categoryAliasMap[category] ?? category;
    }

    const filteredScopes = $derived.by(() => {
        const scopesById = new Map(allScopesList.map((scope) => [scope.scope, scope]));

        const databasesWriteIndex = allScopesList.findIndex((s) => s.scope === 'databases.write');
        if (isCloud && databasesWriteIndex !== -1) {
            const normalizedBackupScopes = cloudOnlyBackupScopes.map((scope) => ({
                ...scope,
                category: normalizeCategory(scope.category)
            }));
            const backupScopeIds = new Set(normalizedBackupScopes.map((scope) => scope.scope));

            for (const scope of normalizedBackupScopes) {
                if (!scopesById.has(scope.scope)) {
                    scopesById.set(scope.scope, scope);
                }
            }

            const mergedScopes = Array.from(scopesById.values());
            const nonBackupScopes = mergedScopes.filter(
                (scope) => !backupScopeIds.has(scope.scope)
            );
            const mergedDatabasesWriteIndex = nonBackupScopes.findIndex(
                (s) => s.scope === 'databases.write'
            );

            return [
                ...nonBackupScopes.slice(0, mergedDatabasesWriteIndex + 1),
                ...normalizedBackupScopes.map((scope) => scopesById.get(scope.scope) ?? scope),
                ...nonBackupScopes.slice(mergedDatabasesWriteIndex + 1)
            ];
        }
        return allScopesList;
    });

    const categories = $derived.by(() => {
        return Array.from(
            new Set(filteredScopes.map((scope) => normalizeCategory(scope.category)))
        );
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
            const scopesById = new Map<string, ScopeDefinition>();

            for (const scope of result.scopes) {
                scopesById.set(scope.$id, {
                    scope: scope.$id,
                    description: scope.description,
                    category: normalizeCategory(scope.category),
                    deprecated: scope.deprecated,
                    icon: ''
                });
            }

            for (const scope of localScopes) {
                if (!scopesById.has(scope.scope)) {
                    scopesById.set(scope.scope, {
                        ...scope,
                        category: normalizeCategory(scope.category)
                    });
                }
            }

            allScopesList = Array.from(scopesById.values());

            for (const s of filteredScopes) {
                activeScopes[s.scope] = effectiveScopes.includes(s.scope);
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
        const scopeSet = new Set(getEffectiveScopes(s));
        const activeInCategory = scopesByCategory.filter((scopeItem) =>
            scopeSet.has(scopeItem.scope)
        );

        if (activeInCategory.length === 0) {
            return false;
        } else if (activeInCategory.length === scopesByCategory.length) {
            return true;
        }

        return 'indeterminate';
    }

    function onCategoryChange(event: CustomEvent<boolean | 'indeterminate'>, category: string) {
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
                (n) => n.category === category && effectiveScopes.includes(n.scope)
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
                        <Layout.Stack inline direction="row" alignItems="center" gap="xxs">
                            <Selector.Checkbox
                                size="s"
                                id={scope.scope}
                                label={scope.scope}
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
