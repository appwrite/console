<script lang="ts">
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import { template, templateConfig } from '../store';
    import { FormList, Helper } from '$lib/elements/forms';
    import { Card, Collapsible, CollapsibleItem } from '$lib/components';
    import AppwriteVariable from '../components/appwriteVariable.svelte';

    async function beforeSubmit() {
        for (const variable of $template.variables) {
            if (!variable.required) {
                continue;
            }

            if (!$templateConfig.variables[variable.name]) {
                throw new Error(`Please set ${variable.name} variable.`);
            }
        }
    }

    $: requiredVariables = $template?.variables?.filter((v) => v.required);
    $: optionalVariables = $template?.variables?.filter((v) => !v.required);
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Environment variables</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Edit the values of the environment variables that will be passed to your function at
        runtime.
    </svelte:fragment>
    {#if $template?.variables?.length}
        {#if requiredVariables?.length}
            <Collapsible>
                <CollapsibleItem open={true}>
                    <svelte:fragment slot="title">Required variables</svelte:fragment>
                    <svelte:fragment slot="subtitle">
                        <span class="inline-tag">{requiredVariables.length}</span>
                    </svelte:fragment>

                    <FormList>
                        {#each requiredVariables as variable}
                            {#if variable.name === 'APPWRITE_API_KEY'}
                                <AppwriteVariable appwriteVariable={variable} />
                            {:else}
                                <div>
                                    <InputText
                                        id={variable.name}
                                        label={variable.name}
                                        placeholder={variable.placeholder ?? 'Enter value'}
                                        required={variable.required}
                                        autocomplete={false}
                                        bind:value={$templateConfig.variables[variable.name]} />

                                    <Helper type="neutral">
                                        {@html variable.description}
                                    </Helper>
                                </div>
                            {/if}
                        {/each}
                    </FormList>
                </CollapsibleItem>
            </Collapsible>
        {/if}

        {#if optionalVariables?.length}
            <Collapsible>
                <CollapsibleItem open={!requiredVariables?.length}>
                    <svelte:fragment slot="title">Optional variables</svelte:fragment>
                    <svelte:fragment slot="subtitle">
                        <span class="inline-tag">{optionalVariables.length}</span>
                    </svelte:fragment>

                    <FormList>
                        {#each optionalVariables as variable}
                            {#if variable.name === 'APPWRITE_API_KEY'}
                                <AppwriteVariable appwriteVariable={variable} />
                            {:else}
                                <div>
                                    <InputText
                                        id={variable.name}
                                        label={variable.name}
                                        placeholder={variable.placeholder ?? 'Enter value'}
                                        required={variable.required}
                                        autocomplete={false}
                                        bind:value={$templateConfig.variables[variable.name]} />

                                    <Helper type="neutral">
                                        {@html variable.description}
                                    </Helper>
                                </div>
                            {/if}
                        {/each}
                    </FormList>
                </CollapsibleItem>
            </Collapsible>
        {/if}
    {:else}
        <Card isDashed>There are no environment variables to configure.</Card>
    {/if}
</WizardStep>
