<script lang="ts">
    import { scopes } from '$lib/constants';
    import { FormList, InputChoice } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { onMount } from 'svelte';
    import { template, templateConfig } from '../store';
    import { tooltip } from '$lib/actions/tooltip';

    let templateScopes = [];
    onMount(() => {
        $templateConfig.execute = $template.permissions.includes('any');
        templateScopes = scopes
            // hot fix for perplexity chat template,
            // backend doesn't have scopes for this template.
            // TODO: @itznotabug fix on backend too.
            .filter((scope) => ($template.scopes ?? []).includes(scope.scope))
            .map((scope) => ({
                ...scope,
                active: true
            }));
    });

    $: $templateConfig.scopes = templateScopes
        ?.filter((scope) => scope.active)
        ?.map((scope) => scope.scope);
</script>

<WizardStep>
    <svelte:fragment slot="title">Permissions</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Enable recommended scopes and execute access for when your function is deployed.
    </svelte:fragment>
    <h3 class="label">Execute permissions</h3>
    <FormList class="u-margin-block-start-16">
        <div class="user-profile">
            <span class="avatar" style:--p-text-size="1rem">
                <span class="icon-lock-open" />
            </span>
            <span class="user-profile-info u-flex u-main-space-between u-gap-16">
                <div>
                    <p class="name u-bold">
                        Public (anyone can execute) <span
                            class="icon-info"
                            use:tooltip={{
                                content:
                                    'You can further customize execute permissions in your function settings.'
                            }} />
                    </p>
                    <p class="text u-margin-block-start-4">
                        This could include unauthorized users and bots.
                    </p>
                </div>

                <InputChoice
                    type="switchbox"
                    id="execute"
                    label="Execute"
                    showLabel={false}
                    bind:value={$templateConfig.execute}></InputChoice>
            </span>
        </div>
    </FormList>
    {#if templateScopes.length > 0}
        <h3 class="label u-margin-block-start-48">Function scopes</h3>
        <FormList class="u-margin-block-start-16">
            {#each templateScopes as scope, i}
                <div class="user-profile">
                    <span class="avatar" style:--p-text-size="1rem">
                        <span class={`icon-${scope.icon}`} />
                    </span>
                    <span class="user-profile-info u-flex u-main-space-between u-gap-16">
                        <div>
                            <p class="name u-bold">{scope.scope}</p>
                            <p class="text u-margin-block-start-4">{scope.description}</p>
                        </div>
                        <InputChoice
                            type="switchbox"
                            id={scope.scope}
                            label={scope.scope}
                            showLabel={false}
                            bind:value={scope.active}>
                        </InputChoice>
                    </span>
                </div>
                {#if i < templateScopes.length - 1}
                    <div class="with-separators"></div>
                {/if}
            {/each}
        </FormList>
    {/if}
</WizardStep>
