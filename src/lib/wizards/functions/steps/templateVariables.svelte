<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { template, templateConfig } from '../store';
    import {
        FormList,
        Helper,
        InputPassword,
        InputText,
        InputURL,
        InputPhone,
        InputEmail,
        InputNumber
    } from '$lib/elements/forms';
    import { Card, Collapsible, CollapsibleItem } from '$lib/components';
    import AppwriteVariable from '../components/appwriteVariable.svelte';
    import type { SvelteComponent } from 'svelte';

    async function beforeSubmit() {
        for (const variable of $template.variables) {
            if (!variable.required) {
                continue;
            }
            if (variable.name === 'APPWRITE_API_KEY') {
                if ($templateConfig.appwriteApiKey || $templateConfig.generateKey) continue;
                else throw new Error(`Please set ${variable.name} variable or generate it.`);
            }
            if (!$templateConfig.variables[variable.name]) {
                throw new Error(`Please set ${variable.name} variable.`);
            }
        }
    }

    $: requiredVariables = $template?.variables?.filter((v) => v.required);
    $: optionalVariables = $template?.variables?.filter((v) => !v.required);

    function selectComponent(
        variableType: 'password' | 'text' | 'number' | 'email' | 'url' | 'phone'
    ): typeof SvelteComponent<unknown> {
        switch (variableType) {
            case 'password':
                return InputPassword;
            case 'text':
                return InputText;
            case 'url':
                return InputURL;
            case 'phone':
                return InputPhone;
            case 'email':
                return InputEmail;
            case 'number':
                return InputNumber;
            default:
                return InputPassword;
        }
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Variables</svelte:fragment>
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
                                    <svelte:component
                                        this={selectComponent(variable.type)}
                                        id={variable.name}
                                        label={variable.name}
                                        placeholder={variable.placeholder ?? 'Enter value'}
                                        required={variable.required}
                                        autocomplete={false}
                                        minlength={variable.type === 'password' ? 0 : null}
                                        showPasswordButton={variable.type === 'password'}
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
                                    <svelte:component
                                        this={selectComponent(variable.type)}
                                        id={variable.name}
                                        label={variable.name}
                                        placeholder={variable.placeholder ?? 'Enter value'}
                                        required={variable.required}
                                        autocomplete={false}
                                        showPasswordButton={variable.type === 'password'}
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
        <Card isDashed>
            <p class="text u-text-center">There are no environment variables to configure.</p>
        </Card>
    {/if}
</WizardStep>
