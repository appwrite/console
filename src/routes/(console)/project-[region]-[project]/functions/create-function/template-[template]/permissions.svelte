<script lang="ts">
    import { scopes } from '$lib/constants';
    import { Fieldset, Layout, Selector } from '@appwrite.io/pink-svelte';

    export let templateScopes: string[];
    export let selectedScopes: string[];
    export let execute = true;

    let scopeList = scopes
        .filter((s) => templateScopes.includes(s.scope))
        .map((s) => {
            selectedScopes.push(s.scope);
            return {
                value: s,
                checked: true
            };
        });

    $: console.log(selectedScopes);
</script>

<Fieldset legend="Permissions">
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
                            .map((s) => s.value.scope);
                    }}>
                </Selector.Switch>
            {/each}
        {/if}
    </Layout.Stack>
</Fieldset>
