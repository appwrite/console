<script lang="ts">
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import { Button, FormList, InputChoice } from '$lib/elements/forms';
    import { scopes as allScopes } from '$lib/constants';
    import { onMount } from 'svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import Checkbox from './checkbox.svelte';

    export let scopes: string[];

    enum Category {
        Auth = 'Auth',
        Database = 'Database',
        Functions = 'Functions',
        Messaging = 'Messaging',
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

    function categoryState(category: string, s: string[]): boolean | null {
        const scopesByCategory = allScopes.filter((n) => n.category === category);
        const filtered = scopesByCategory.filter((n) => s.includes(n.scope));
        if (filtered.length === 0) {
            return false;
        } else if (filtered.length === scopesByCategory.length) {
            return true;
        } else {
            return null;
        }
    }

    function onCategoryChange(event: Event, category: Category) {
        allScopes.forEach((s) => {
            if (s.category === category) {
                activeScopes[s.scope] = (
                    event.currentTarget as EventTarget & HTMLInputElement
                ).checked;
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
</script>

<ul class="buttons-list u-main-end">
    <li class="buttons-list-item">
        <Button text on:click={deselectAll}>Deselect all</Button>
    </li>
    <li class="buttons-list-item">
        <Button text on:click={selectAll}>Select all</Button>
    </li>
</ul>

<Collapsible>
    {#each [Category.Auth, Category.Database, Category.Functions, Category.Storage, Category.Messaging, Category.Other] as category}
        {@const checked = categoryState(category, scopes)}
        <CollapsibleItem withIndentation>
            <svelte:fragment slot="beforetitle">
                <Checkbox
                    {checked}
                    indeterminate={checked === null ? true : false}
                    on:change={(e) => onCategoryChange(e, category)} />
            </svelte:fragment>
            <svelte:fragment slot="title">
                {category}
            </svelte:fragment>
            <svelte:fragment slot="subtitle">
                {@const scopesLength = allScopes.filter(
                    (n) => n.category === category && scopes.includes(n.scope)
                ).length}
                ({scopesLength}
                {scopesLength === 1 ? 'Scope' : 'Scopes'})
            </svelte:fragment>
            <div class="form">
                <FormList>
                    {#each allScopes.filter((s) => s.category === category) as scope}
                        <InputChoice
                            id={scope.scope}
                            label={scope.scope}
                            bind:value={activeScopes[scope.scope]}>
                            {scope.description}
                        </InputChoice>
                    {/each}
                </FormList>
            </div>
        </CollapsibleItem>
    {/each}
</Collapsible>
