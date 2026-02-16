<script lang="ts">
    import { scopes } from '$lib/constants';
    import { Fieldset, Layout, Selector } from '@appwrite.io/pink-svelte';
    import type { Scopes } from '@appwrite.io/console';

    export let templateScopes: string[];
    export let selectedScopes: Scopes[];
    export let execute = true;

    let scopeList = scopes
        .filter((s) => templateScopes.includes(s.scope))
        .map((s) => {
            selectedScopes.push(s.scope as Scopes);
            return {
                value: s,
                checked: true
            };
        });
</script>

<Fieldset legend="Security">
    <Layout.Stack gap="l">
        <Selector.Switch
            id="execute"
            label="Public (anyone can execute)"
            description="This could include unauthorized users and bots. You can further customize execute
        permissions in your function settings."
            bind:checked={execute}>
        </Selector.Switch>

        {#if scopeList.length > 0}
            {#each scopeList as scope}
                <Selector.Switch
                    id={scope.value.scope}
                    label={scope.value.scope}
                    description={scope.value.description}
                    bind:checked={scope.checked}
                    on:change={() => {
                        selectedScopes = scopeList
                            .filter((s) => s.checked)
                            .map((s) => s.value.scope as Scopes);
                    }}>
                </Selector.Switch>
            {/each}
        {/if}
    </Layout.Stack>
</Fieldset>
