<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { scopes as allScopes } from '$lib/constants';
    import { onMount } from 'svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Accordion, Divider, Layout, Selector } from '@appwrite.io/pink-svelte';

    export let scopes: string[];

    enum Category {
        Auth = 'Auth',
        Database = 'Database',
        Functions = 'Functions',
        Messaging = 'Messaging',
        Sites = 'Sites',
        Storage = 'Storage',
        Other = 'Other'
    }

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
        const scopesByCategory = allScopes.filter((n) => n.category === category);
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
        allScopes.forEach((s) => {
            if (s.category === category) {
                activeScopes[s.scope] = event.detail;
            }
        });
    }

    const activeScopes = allScopes.reduce((prev, next) => {
        prev[next.scope] = false;

        return prev;
    }, {});

    $: {
        if (mounted) {
            const newScopes = allScopes
                .filter((scope) => activeScopes[scope.scope])
                .map(({ scope }) => scope);

            if (symmetricDifference(scopes, newScopes).length) {
                scopes = newScopes;
            }
        }
    }

    $: console.log(scopes);
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

        {#each [Category.Auth, Category.Database, Category.Functions, Category.Storage, Category.Messaging, Category.Sites, Category.Other] as category}
            {@const checked = categoryState(category, scopes)}
            {@const scopesLength = allScopes.filter(
                (n) => n.category === category && scopes.includes(n.scope)
            ).length}
            <Accordion
                selectable
                title={category}
                badge={`${scopesLength} ${scopesLength === 1 ? 'Scope' : 'Scopes'}`}
                {checked}
                on:change={(event) => onCategoryChange(event, category)}>
                <Layout.Stack>
                    {#each allScopes.filter((s) => s.category === category) as scope}
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
