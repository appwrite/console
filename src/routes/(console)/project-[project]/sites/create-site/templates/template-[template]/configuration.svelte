<script lang="ts">
    import {
        Button,
        InputEmail,
        InputNumber,
        InputPassword,
        InputPhone,
        InputText,
        InputURL
    } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Fieldset, Layout, Popover, Icon, Accordion } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { type SvelteComponent } from 'svelte';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { project } from '$routes/(console)/project-[project]/store';

    export let variables: Partial<Models.TemplateVariable>[] = [];
    export let templateVariables: Models.TemplateVariable[] = [];

    variables = [...templateVariables];
    let { requiredVariables, optionalVariables } = variables.reduce(
        (acc, variable) => {
            if (variable.required) {
                acc.requiredVariables.push(variable);
            } else {
                acc.optionalVariables.push(variable);
            }
            return acc;
        },
        { requiredVariables: [], optionalVariables: [] }
    );

    variables.map((variable) => {
        if (variable.value === '{apiEndpoint}') {
            variable.value = getApiEndpoint();
            variable.placeholder = getApiEndpoint();
        } else if (variable.value === '{projectId}') {
            variable.value = $page.params.project;
            variable.placeholder = $page.params.project;
        } else if (variable.value === '{projectName}') {
            variable.value = $project.name;
            variable.placeholder = $project.name;
        } else return variable;
    });
    variables = [...variables];

    function selectComponent(variableType: string): typeof SvelteComponent<unknown> {
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

    $: console.log(variables);
</script>

<Fieldset legend="Settings">
    <Layout.Stack gap="l">
        <Layout.Stack>
            {#if requiredVariables?.length}
                <Accordion title="Required environment variables" open>
                    <Layout.Stack>
                        Provide the values for the required environment variables to run this
                        application.

                        {#each requiredVariables as variable}
                            <Layout.Stack gap="s" direction="row">
                                <Layout.Stack gap="s" direction="row">
                                    <InputText id={variable.name} value={variable.name} readonly />
                                    <svelte:component
                                        this={selectComponent(variable.type)}
                                        id={variable.name}
                                        placeholder={variable.placeholder ?? 'Enter value'}
                                        required={variable.required}
                                        autocomplete={false}
                                        minlength={variable.type === 'password' ? 0 : null}
                                        showPasswordButton={variable.type === 'password'}
                                        bind:value={variable.value} />
                                </Layout.Stack>
                                <Popover placement="bottom-end" let:toggle>
                                    <Button
                                        secondary
                                        icon
                                        on:click={(e) => {
                                            e.preventDefault();
                                            toggle(e);
                                        }}>
                                        <Icon size="s" icon={IconInfo} /></Button>
                                    <p slot="tooltip">{variable.description}</p>
                                </Popover>
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Accordion>
            {/if}
            {#if optionalVariables?.length}
                <Accordion title="Environment variables" badge="Optional">
                    <Layout.Stack>
                        Set up environment variables to securely manage keys and settings for your
                        project.

                        {#each optionalVariables as variable}
                            <Layout.Stack gap="s" direction="row">
                                <Layout.Stack gap="s" direction="row">
                                    <InputText id={variable.name} value={variable.name} readonly />
                                    <svelte:component
                                        this={selectComponent(variable.type)}
                                        id={variable.name}
                                        placeholder={variable.placeholder ?? 'Enter value'}
                                        required={variable.required}
                                        autocomplete={false}
                                        minlength={variable.type === 'password' ? 0 : null}
                                        showPasswordButton={variable.type === 'password'}
                                        bind:value={variables[variable.name].value} />
                                </Layout.Stack>
                                <Popover placement="bottom-end" let:toggle>
                                    <Button
                                        secondary
                                        icon
                                        on:click={(e) => {
                                            e.preventDefault();
                                            toggle(e);
                                        }}>
                                        <Icon size="s" icon={IconInfo} /></Button>
                                    <p slot="tooltip">{variable.description}</p>
                                </Popover>
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Accordion>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Fieldset>
