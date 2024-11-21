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
    import SecretVariableModal from './secretVariableModal.svelte';
    import ImportSiteVariablesModal from './importSiteVariablesModal.svelte';

    //TODO: fix type after backend fix
    export let frameworks: Models.Framework[];
    export let selectedFramework = frameworks[0];
    export let variables: Partial<Models.Variable>[] = [];
    export let installCommand = '';
    export let buildCommand = '';
    export let outputDirectory = '';

    let showEditorModal = false;
    let showImportModal = false;
    let showSecretModal = false;

    let currentVariable: Partial<Models.Variable>;
    let frameworkId = selectedFramework.key;

    function markAsSecret() {
        let variable = variables.find((v) => v.key === currentVariable.key);
        if (variable) {
            variable.secret = true;
        }
    }

    $: frameworkData = frameworks.find((framework) => framework.key === selectedFramework.key);
</script>

<Fieldset legend="Configuration">
    <Layout.Stack gap="l">
        <InputSelect
            id="framework"
            label="Framework"
            placeholder="Select framework"
            bind:value={frameworkId}
            options={frameworks.map((framework) => ({
                value: framework.key,
                label: framework.name
            }))}
            on:change={() => {
                selectedFramework = frameworks.find((framework) => framework.key === frameworkId);
            }} />

        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">
                    Build settings <Tag size="s">Optional</Tag>
                </svelte:fragment>
                <Layout.Stack>
                    Set up how your project is built and where the output files are stored.
                    <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                        <InputText
                            id="installCommand"
                            label="Install command"
                            bind:value={installCommand}
                            placeholder={frameworkData?.installCommand} />
                        <Button secondary size="s" on:click={() => (installCommand = '')}>
                            Reset
                        </Button>
                    </Layout.Stack>
                    <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                        <InputText
                            id="buildCommand"
                            label="Build command"
                            bind:value={buildCommand}
                            placeholder={frameworkData?.buildCommand} />
                        <Button secondary size="s" on:click={() => (buildCommand = '')}>
                            Reset
                        </Button>
                    </Layout.Stack>
                    <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                        <InputText
                            id="outputDirectory"
                            label="Output directory"
                            bind:value={outputDirectory}
                            placeholder={frameworkData?.outputDirectory} />
                        <Button secondary size="s" on:click={() => (outputDirectory = '')}>
                            Reset
                        </Button>
                    </Layout.Stack>
                </Layout.Stack>
            </CollapsibleItem>

            <CollapsibleItem>
                <svelte:fragment slot="title">
                    Environment variables <Tag size="s">Optional</Tag>
                </svelte:fragment>
                <Layout.Stack gap="l">
                    <Layout.Stack gap="xl">
                        Set up environment variables to securely manage keys and settings for your
                        project.

                        {#if variables?.length}
                            <Table.Root>
                                <svelte:fragment slot="header">
                                    <Table.Header.Cell width="200px">Key</Table.Header.Cell>
                                    <Table.Header.Cell>Value</Table.Header.Cell>
                                    <Table.Header.Cell width="10px"></Table.Header.Cell>
                                </svelte:fragment>
                                {#each variables as variable}
                                    <Table.Row>
                                        <Table.Cell>{variable.key}</Table.Cell>
                                        <Table.Cell>
                                            <!-- TODO: fix max width -->
                                            <div style="max-width: 20rem">
                                                {#if variable.secret}
                                                    <Badge content="Secret" variant="secondary" />
                                                {:else}
                                                    <HiddenText
                                                        isVisible={false}
                                                        text={variable.value} />
                                                {/if}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div style="margin-inline-start: auto">
                                                <Popover placement="bottom-end" let:toggle>
                                                    <Button
                                                        text
                                                        icon
                                                        on:click={(e) => {
                                                            e.preventDefault();
                                                            toggle(e);
                                                        }}>
                                                        <Icon size="s" icon={IconDotsHorizontal} />
                                                    </Button>
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
                                size="s"
                                on:mousedown={() => (showEditorModal = true)}>
                                <Icon icon={IconCode} /> Editor
                            </Button>
                            <Button
                                secondary
                                size="s"
                                on:mousedown={() => (showImportModal = true)}>
                                <Icon icon={IconUpload} /> Import .env
                            </Button>
                        </Layout.Stack>
                        <Button secondary size="s" on:mousedown={() => (showImportModal = true)}>
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
    <ImportSiteVariablesModal bind:show={showImportModal} bind:variables />
{/if}
