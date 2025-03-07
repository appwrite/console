<script lang="ts">
    import { scopes } from '$lib/constants';
    import { Fieldset, Layout, Selector } from '@appwrite.io/pink-svelte';

    export let templateScopes: string[];

    let execute = false;
    // onMount(() => {
    //     $templateConfig.execute = $template.permissions.includes('any');
    //     templateScopes = scopes
    //         .filter((scope) => $template.scopes.includes(scope.scope))
    //         .map((scope) => ({
    //             ...scope,
    //             active: true
    //         }));
    // });

    // $: $templateConfig.scopes = templateScopes
    //     ?.filter((scope) => scope.active)
    //     ?.map((scope) => scope.scope);

    $: console.log(templateScopes);
    $: console.log(scopes);
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

        {#if templateScopes.length > 0}
            {#each templateScopes as s}
                {@const scope = scopes.find((sc) => sc.scope === s)}
                <Selector.Switch
                    id={scope.scope}
                    label={scope.scope}
                    description={scope.description}
                    bind:checked={execute}>
                </Selector.Switch>
            {/each}
        {/if}
    </Layout.Stack>
</Fieldset>
