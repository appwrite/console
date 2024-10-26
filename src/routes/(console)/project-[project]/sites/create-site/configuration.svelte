<script lang="ts">
    import { Collapsible, CollapsibleItem, Empty } from '$lib/components';
    import {
        Button,
        InputEmail,
        InputNumber,
        InputPassword,
        InputPhone,
        InputSelect,
        InputText,
        InputURL
    } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import {
        Fieldset,
        Layout,
        Tag,
        Popover,
        Icon,
        Table,
        Badge,
        HiddenText
    } from '@appwrite.io/pink-svelte';
    import {
        IconInfo,
        IconDotsHorizontal,
        IconCode,
        IconUpload
    } from '@appwrite.io/pink-icons-svelte';
    import type { SvelteComponent } from 'svelte';
    import RawVariableEditor from '../../rawVariableEditor.svelte';

    export let source: 'repository' | 'template' = 'repository';

    //TODO: fix type after backend fix
    export let frameworks: Models.Framework[] & {
        installCommand: string;
        buildCommand: string;
        outputDirectory: string;
    } = [];
    export let framework = frameworks[0]?.$id;
    export let variables: Partial<Models.TemplateVariable>[] = [];
    export let templateVariables: Models.TemplateVariable[] = [];
    export let installCommand = '';
    export let buildCommand = '';
    export let outputDirectory = '';

    let showEditorModal = false;
    let showImportModal = false;

    let { requiredVariables, optionalVariables } = templateVariables.reduce(
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
</script>

{#if source === 'repository' || templateVariables?.length}
    <Fieldset legend="Configuration">
        <Layout.Stack gap="l">
            {#if source === 'repository'}
                <InputSelect
                    id="framework"
                    label="Framework"
                    placeholder="Select framework"
                    bind:value={framework}
                    options={frameworks.map((framework) => ({
                        value: framework.$id,
                        label: framework.name
                    }))} />
            {/if}

            <Collapsible>
                {#if source === 'repository'}
                    {@const frameworkData = frameworks.find((f) => f.$id === framework)}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            Build settings <Tag size="small">Optional</Tag>
                        </svelte:fragment>
                        <Layout.Stack>
                            Set up how your project is built and where the output files are stored.
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="installCommand"
                                    label="Install command"
                                    bind:value={installCommand}
                                    placeholder={frameworkData?.installCommand} />
                                <Button
                                    secondary
                                    size="small"
                                    on:click={() => (installCommand = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="buildCommand"
                                    label="Build command"
                                    bind:value={buildCommand}
                                    placeholder={frameworkData?.buildCommand} />
                                <Button secondary size="small" on:click={() => (buildCommand = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="outputDirectory"
                                    label="Output directory"
                                    bind:value={outputDirectory}
                                    placeholder={frameworkData?.outputDirectory} />
                                <Button
                                    secondary
                                    size="small"
                                    on:click={() => (outputDirectory = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                        </Layout.Stack>
                    </CollapsibleItem>
                {/if}
                {#if requiredVariables?.length}
                    <CollapsibleItem open>
                        <svelte:fragment slot="title">
                            Required environment variables
                        </svelte:fragment>
                        <Layout.Stack>
                            Provide the values for the required environment variables to run this
                            application.

                            {#each requiredVariables as variable}
                                <Layout.Stack gap="s" direction="row">
                                    <Layout.Stack gap="s" direction="row">
                                        <div style="flex-basis:1; width: 100%">
                                            <InputText
                                                id={variable.name}
                                                value={variable.name}
                                                readonly />
                                        </div>
                                        <div style="flex-basis:1;width: 100%">
                                            <svelte:component
                                                this={selectComponent(variable.type)}
                                                id={variable.name}
                                                placeholder={variable.placeholder ?? 'Enter value'}
                                                required={variable.required}
                                                autocomplete={false}
                                                minlength={variable.type === 'password' ? 0 : null}
                                                showPasswordButton={variable.type === 'password'}
                                                bind:value={variables[variable.name].value} />
                                        </div>
                                    </Layout.Stack>
                                    <Popover placement="bottom-end" let:toggle>
                                        <Button
                                            secondary
                                            icon
                                            on:click={(e) => {
                                                e.preventDefault();
                                                toggle(e);
                                            }}>
                                            <Icon size="small" icon={IconInfo} /></Button>
                                        <p slot="tooltip">{variable.description}</p>
                                    </Popover>
                                </Layout.Stack>
                            {/each}
                        </Layout.Stack>
                    </CollapsibleItem>
                {/if}
                {#if optionalVariables?.length}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            Environment variables <Tag size="small">Optional</Tag>
                        </svelte:fragment>
                        <Layout.Stack>
                            Set up environment variables to securely manage keys and settings for
                            your project.

                            {#each optionalVariables as variable}
                                <Layout.Stack gap="s" direction="row">
                                    <Layout.Stack gap="s" direction="row">
                                        <div style="flex-basis:1; width: 100%">
                                            <InputText
                                                id={variable.name}
                                                value={variable.name}
                                                readonly />
                                        </div>
                                        <div style="flex-basis:1;width: 100%">
                                            <svelte:component
                                                this={selectComponent(variable.type)}
                                                id={variable.name}
                                                placeholder={variable.placeholder ?? 'Enter value'}
                                                required={variable.required}
                                                autocomplete={false}
                                                minlength={variable.type === 'password' ? 0 : null}
                                                showPasswordButton={variable.type === 'password'}
                                                bind:value={variables[variable.name].value} />
                                        </div>
                                    </Layout.Stack>
                                    <Popover placement="bottom-end" let:toggle>
                                        <Button
                                            secondary
                                            icon
                                            on:click={(e) => {
                                                e.preventDefault();
                                                toggle(e);
                                            }}>
                                            <Icon size="small" icon={IconInfo} /></Button>
                                        <p slot="tooltip">{variable.description}</p>
                                    </Popover>
                                </Layout.Stack>
                            {/each}
                        </Layout.Stack>
                    </CollapsibleItem>
                {/if}
                {#if source === 'repository'}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            Environment variables <Tag size="small">Optional</Tag>
                        </svelte:fragment>
                        <Layout.Stack gap="l">
                            <Layout.Stack gap="xl">
                                Set up environment variables to securely manage keys and settings
                                for your project.

                                {#if variables?.length}
                                    <Table.Root>
                                        <svelte:fragment slot="header">
                                            <Table.Cell>Key</Table.Cell>
                                            <Table.Cell>Value</Table.Cell>
                                            <Table.Cell width="10"></Table.Cell>
                                        </svelte:fragment>
                                        {#each variables as variable}
                                            <Table.Row>
                                                <Table.Cell>{variable.name}</Table.Cell>
                                                <Table.Cell>
                                                    <div>
                                                        {#if variable.secret}
                                                            <Badge
                                                                content="Secret"
                                                                variant="secondary" />
                                                        {:else}
                                                            <HiddenText text={variable.value} />
                                                        {/if}
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell width="10">
                                                    <div style="margin-inline-start: auto">
                                                        <Popover placement="bottom-end" let:toggle>
                                                            <Button
                                                                text
                                                                icon
                                                                on:click={(e) => {
                                                                    e.preventDefault();
                                                                    toggle(e);
                                                                }}>
                                                                <Icon
                                                                    size="small"
                                                                    icon={IconDotsHorizontal} /></Button>
                                                            <p slot="tooltip">hi</p>
                                                        </Popover>
                                                    </div>
                                                </Table.Cell>
                                            </Table.Row>
                                        {/each}
                                    </Table.Root>
                                {:else}
                                    <Empty>Create variables to get started</Empty>
                                {/if}
                            </Layout.Stack>
                            <Layout.Stack direction="row">
                                <Button
                                    secondary
                                    size="small"
                                    on:mousedown={() => (showEditorModal = true)}>
                                    <Icon icon={IconCode} /> Editor
                                </Button>
                                <Button
                                    secondary
                                    size="small"
                                    on:mousedown={() => (showImportModal = true)}>
                                    <Icon icon={IconUpload} /> Import .env
                                </Button>
                            </Layout.Stack>
                        </Layout.Stack>
                    </CollapsibleItem>
                {/if}
            </Collapsible>
        </Layout.Stack>
    </Fieldset>
{/if}

{#if showEditorModal && source === 'repository'}
    <!-- <RawVariableEditor
        {isGlobal}
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        {variableList}
        bind:showEditor={showEditorModal} /> -->
{/if}
