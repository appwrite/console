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
    import {
        Fieldset,
        Layout,
        Popover,
        Icon,
        Accordion,
        ActionMenu
    } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { type Component } from 'svelte';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import { page } from '$app/state';
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
            variable.value = page.params.project;
            variable.placeholder = page.params.project;
        } else if (variable.value === '{projectName}') {
            variable.value = $project.name;
            variable.placeholder = $project.name;
        } else return variable;
    });
    variables = [...variables];

    function selectComponent(variableType: string): Component {
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

<Fieldset legend="Environment variables">
    <Layout.Stack gap="l">
        <Layout.Stack>
            {#if requiredVariables?.length}
                <Accordion title="Required variables" open hideDivider={!optionalVariables?.length}>
                    <Layout.Stack>
                        {#each requiredVariables as variable, i}
                            <Layout.Stack gap="s" direction="row">
                                <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                    <InputText
                                        id={variable.name}
                                        value={variable.name}
                                        readonly
                                        label={i === 0 ? 'Key' : null} />
                                    <svelte:component
                                        this={selectComponent(variable.type)}
                                        label={i === 0 ? 'Value' : null}
                                        id={variable.name}
                                        placeholder={variable.placeholder ?? 'Enter value'}
                                        required={variable.required}
                                        autocomplete={false}
                                        minlength={variable.type === 'password' ? 0 : null}
                                        showPasswordButton={variable.type === 'password'}
                                        bind:value={variable.value} />
                                </Layout.Stack>
                                <Layout.Stack gap="s" justifyContent="flex-end" inline>
                                    <Popover let:toggle>
                                        <Button
                                            secondary
                                            icon
                                            on:click={(e) => {
                                                e.preventDefault();
                                                toggle(e);
                                            }}>
                                            <Icon icon={IconInfo} /></Button>
                                        <ActionMenu.Root slot="tooltip">
                                            <p>{variable.description}</p>
                                        </ActionMenu.Root>
                                    </Popover>
                                </Layout.Stack>
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Accordion>
            {/if}
            {#if optionalVariables?.length}
                <Accordion title="Optional variables" hideDivider>
                    <Layout.Stack>
                        {#each optionalVariables as variable, i}
                            <Layout.Stack gap="s" direction="row">
                                <Layout.Stack gap="s" direction="row">
                                    <InputText
                                        id={variable.name}
                                        value={variable.name}
                                        readonly
                                        label={i === 0 ? 'Key' : null} />
                                    <svelte:component
                                        this={selectComponent(variable.type)}
                                        label={i === 0 ? 'Value' : null}
                                        id={variable.name}
                                        placeholder={variable.placeholder ?? 'Enter value'}
                                        required={variable.required}
                                        autocomplete={false}
                                        minlength={variable.type === 'password' ? 0 : null}
                                        showPasswordButton={variable.type === 'password'}
                                        bind:value={variable.value} />
                                </Layout.Stack>
                                <Layout.Stack gap="s" justifyContent="flex-end" inline>
                                    <Popover let:toggle>
                                        <Button
                                            secondary
                                            icon
                                            on:click={(e) => {
                                                e.preventDefault();
                                                toggle(e);
                                            }}>
                                            <Icon icon={IconInfo} /></Button>
                                        <ActionMenu.Root slot="tooltip">
                                            <p>{variable.description}</p>
                                        </ActionMenu.Root>
                                    </Popover>
                                </Layout.Stack>
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Accordion>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Fieldset>
