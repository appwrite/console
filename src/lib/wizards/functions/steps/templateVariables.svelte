<script lang="ts">
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import { template, templateConfig } from '../store';
    import { FormList, Helper, InputChoice } from '$lib/elements/forms';
    import { Collapsible, CollapsibleItem } from '$lib/components';

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

    $: appwriteVariable = $template.variables.find((v) => v.name === 'APPWRITE_API_KEY');
    $: requiredVariables = $template?.variables?.filter(
        (v) => v.required && v.name !== 'APPWRITE_API_KEY'
    );
    $: optionalVariables = $template?.variables?.filter(
        (v) => !v.required && v.name !== 'APPWRITE_API_KEY'
    );
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
                        {/each}
                    </FormList>
                </CollapsibleItem>
            </Collapsible>
        {/if}

        {#if appwriteVariable}
            <div
                class="box"
                style:--box-padding="1rem"
                style:--box-border-radius="var(--border-radius-small)">
                <FormList>
                    <div>
                        <InputText
                            id={appwriteVariable.name}
                            label={appwriteVariable.name}
                            placeholder={appwriteVariable.placeholder ?? 'Enter value'}
                            required={appwriteVariable.required}
                            autocomplete={false}
                            bind:value={$templateConfig.appwriteApiKey} />
                        <Helper type="neutral">
                            This API key will allow you to interact with the Appwrite server APIs. <a
                                href="http://#"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="link">Learn more</a
                            >.
                        </Helper>
                    </div>
                    <InputChoice id="generate" label="Generate API key on completion">
                        The <code class="inline-code">APPWRITE_API_KEY</code> will be automatically generated
                        for your project and applied to this function once it's created.
                    </InputChoice>
                </FormList>
            </div>
        {/if}
        {#if optionalVariables?.length}
            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Optional variables</svelte:fragment>
                    <svelte:fragment slot="subtitle">
                        <span class="inline-tag">{optionalVariables.length}</span>
                    </svelte:fragment>

                    <FormList>
                        {#each optionalVariables as variable}
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
                        {/each}
                    </FormList>
                </CollapsibleItem>
            </Collapsible>
        {/if}
    {/if}
</WizardStep>
