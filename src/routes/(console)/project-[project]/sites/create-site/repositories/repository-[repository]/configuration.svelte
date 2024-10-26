<script lang="ts">
    import { Collapsible, CollapsibleItem, Empty } from '$lib/components';
    import { Button, InputSelect, InputText } from '$lib/elements/forms';
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
        IconDotsHorizontal,
        IconCode,
        IconUpload,
        IconPlus,
        IconTrash,
        IconEyeOff,
        IconPencil
    } from '@appwrite.io/pink-icons-svelte';
    import RawVariableEditor from '../../rawVariableEditor.svelte';
    import SecretVariableModal from './secretVariableModal.svelte';

    //TODO: fix type after backend fix
    export let frameworks: Models.Framework[] & {
        installCommand: string;
        buildCommand: string;
        outputDirectory: string;
    } = [];
    export let framework = frameworks[0]?.$id;
    export let variables: Partial<Models.TemplateVariable>[] = [];
    export let installCommand = '';
    export let buildCommand = '';
    export let outputDirectory = '';

    let showEditorModal = false;
    let showImportModal = false;
    let showSecretModal = false;

    let currentVariable: Partial<Models.TemplateVariable>;

    function markAsSecret() {
        let variable = variables.find((v) => v.name === currentVariable.name);
        if (variable) {
            variable.secret = true;
        }
        console.log(variable);
    }

    $: frameworkData = frameworks.find((framework) => framework.$id === framework.$id);
</script>

<Fieldset legend="Configuration">
    <Layout.Stack gap="l">
        <InputSelect
            id="framework"
            label="Framework"
            placeholder="Select framework"
            bind:value={framework}
            options={frameworks.map((framework) => ({
                value: framework.$id,
                label: framework.name
            }))} />

        <Collapsible>
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
                        <Button secondary size="small" on:click={() => (installCommand = '')}>
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
                        <Button secondary size="small" on:click={() => (outputDirectory = '')}>
                            Reset
                        </Button>
                    </Layout.Stack>
                </Layout.Stack>
            </CollapsibleItem>

            <CollapsibleItem>
                <svelte:fragment slot="title">
                    Environment variables <Tag size="small">Optional</Tag>
                </svelte:fragment>
                <Layout.Stack gap="l">
                    <Layout.Stack gap="xl">
                        Set up environment variables to securely manage keys and settings for your
                        project.

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
                                                    <Badge content="Secret" variant="secondary" />
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
                                                    <svelte:fragment slot="tooltip">
                                                        <Layout.Stack
                                                            gap="s"
                                                            alignItems="flex-start">
                                                            <Button
                                                                text
                                                                on:click={() => {
                                                                    showEditorModal = true;
                                                                }}>
                                                                <Icon icon={IconPencil} /> Edit</Button>
                                                            {#if !variable?.secret}
                                                                <Button
                                                                    text
                                                                    on:click={() => {
                                                                        currentVariable = variable;
                                                                        showSecretModal = true;
                                                                    }}>
                                                                    <Icon icon={IconEyeOff} />
                                                                    Secret</Button>
                                                            {/if}
                                                            <Button
                                                                text
                                                                on:click={() => {
                                                                    showImportModal = true;
                                                                }}>
                                                                <Icon icon={IconTrash} />
                                                                Delete
                                                            </Button>
                                                        </Layout.Stack>
                                                    </svelte:fragment>
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
                        <Button
                            secondary
                            size="small"
                            on:mousedown={() => (showImportModal = true)}>
                            <Icon icon={IconPlus} /> Create variable
                        </Button>
                    </Layout.Stack>
                </Layout.Stack>
            </CollapsibleItem>
        </Collapsible>
    </Layout.Stack>
</Fieldset>

{#if showEditorModal}
    <!-- <RawVariableEditor
        {isGlobal}
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        {variableList}
        bind:showEditor={showEditorModal} /> -->
{/if}

{#if showSecretModal}
    <SecretVariableModal bind:show={showSecretModal} on:click={markAsSecret} />
{/if}

{#if showImportModal}
    <!-- <ImportVariableModal bind:show={showImportModal} /> -->
{/if}
