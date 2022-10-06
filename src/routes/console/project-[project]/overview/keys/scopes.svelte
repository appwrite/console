<script lang="ts">
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import { Button, FormList, InputChoice } from '$lib/elements/forms';
    import { scopes as allScopes } from '$lib/constants';
    import { onMount } from 'svelte';
    import { difference } from '$lib/helpers/array';

    export let scopes: string[];

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

    function unselectAll() {
        for (const scope in activeScopes) {
            activeScopes[scope] = false;
        }
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
            if (
                difference(scopes, newScopes).length !== 0 ||
                difference(newScopes, scopes).length !== 0
            ) {
                scopes = newScopes;
            }
        }
    }
</script>

<div class="u-flex u-cross-center u-main-end">
    <Button text on:click={unselectAll}>Unselect all</Button>
    <Button text on:click={selectAll}>Select all</Button>
</div>
<Collapsible>
    {#each ['Authentication', 'Database', 'Functions', 'Storage', 'Other'] as category}
        <CollapsibleItem>
            <svelte:fragment slot="title">{category}</svelte:fragment>
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
        </CollapsibleItem>
    {/each}
</Collapsible>
