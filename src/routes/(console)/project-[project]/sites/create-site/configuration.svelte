<script lang="ts">
    import { Empty, Paginator } from '$lib/components';
    import { Button, InputSelect, InputText } from '$lib/elements/forms';
    import {
        Fieldset,
        Layout,
        Popover,
        Icon,
        Table,
        Badge,
        InteractiveText,
        ActionMenu,
        Accordion,
        Tooltip,
        Button as PinkButton
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
    import type { Models } from '@appwrite.io/console';
    import { getFrameworkIcon } from '../store';
    import { iconPath } from '$lib/stores/app';
    import VariableEditorModal from './variableEditorModal.svelte';
    import SecretVariableModal from './secretVariableModal.svelte';
    import ImportSiteVariablesModal from './importSiteVariablesModal.svelte';
    import CreateVariableModal from './createVariableModal.svelte';
    import DeleteVariableModal from './deleteVariableModal.svelte';
    import UpdateVariableModal from './updateVariableModal.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export let frameworks: Models.Framework[];
    export let selectedFramework: Models.Framework;
    $: frameworkData = frameworks.find((framework) => framework.key === selectedFramework?.key);
    $: ssr = frameworkData?.adapters.find((adapter) => adapter.key === 'ssr');

    export let variables: Partial<Models.Variable>[] = [];
    export let installCommand = '';
    export let buildCommand = '';
    export let outputDirectory = '';

    let showEditorModal = false;
    let showImportModal = false;
    let showSecretModal = false;
    let showCreate = false;
    let showUpdate = false;
    let showDelete = false;

    let currentVariable: Partial<Models.Variable>;
    let frameworkId = selectedFramework.key;

    $: if (!installCommand || !buildCommand || !outputDirectory) {
        installCommand ||= ssr?.installCommand;
        buildCommand ||= ssr?.buildCommand;
        outputDirectory ||= ssr?.outputDirectory;
    }
</script>

<Fieldset legend="Settings">
    <Layout.Stack gap="l">
        <InputSelect
            id="framework"
            label="Framework"
            placeholder="Select framework"
            bind:value={frameworkId}
            options={frameworks.map((framework) => ({
                value: framework.key,
                label: framework.name,
                leadingHtml: `<img src='${$iconPath(getFrameworkIcon(framework.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
            }))}
            on:change={() => {
                selectedFramework = frameworks.find((framework) => framework.key === frameworkId);
            }} />

        <Layout.Stack>
            <Accordion title="Build settings" badge="Optional">
                <Layout.Stack gap="xl">
                    Set up how your project is built and where the output files are stored.
                    <Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="installCommand"
                                label="Install command"
                                bind:value={installCommand}
                                placeholder={ssr?.installCommand} />
                            <Button
                                secondary
                                size="s"
                                disabled={ssr?.installCommand === installCommand}
                                on:click={() => (installCommand = ssr?.installCommand)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="buildCommand"
                                label="Build command"
                                bind:value={buildCommand}
                                placeholder={ssr?.buildCommand} />
                            <Button
                                secondary
                                size="s"
                                disabled={ssr?.buildCommand === buildCommand}
                                on:click={() => (buildCommand = ssr?.buildCommand)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="outputDirectory"
                                label="Output directory"
                                bind:value={outputDirectory}
                                placeholder={ssr?.outputDirectory} />
                            <Button
                                secondary
                                size="s"
                                disabled={ssr?.outputDirectory === outputDirectory}
                                on:click={() => (outputDirectory = ssr?.outputDirectory)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                    </Layout.Stack>
                </Layout.Stack>
            </Accordion>

            <Accordion title="Environment variables" badge="Optional" hideDivider>
                <svelte:fragment slot="title">
                    Environment variables <Badge content="Optional" variant="secondary" />
                </svelte:fragment>
                <Layout.Stack gap="xl">
                    Set up environment variables to securely manage keys and settings for your
                    project.
                    <Layout.Stack gap="l">
                        <Layout.Stack direction="row">
                            <Layout.Stack direction="row" gap="s">
                                <Button
                                    secondary
                                    size="s"
                                    on:mousedown={() => {
                                        showEditorModal = true;
                                        trackEvent(Click.VariablesUpdateClick, {
                                            source: 'site_configuration'
                                        });
                                    }}>
                                    <Icon slot="start" icon={IconCode} /> Editor
                                </Button>
                                <Button
                                    secondary
                                    size="s"
                                    on:mousedown={() => {
                                        showImportModal = true;
                                        trackEvent(Click.VariablesImportClick, {
                                            source: 'site_configuration'
                                        });
                                    }}>
                                    <Icon slot="start" icon={IconUpload} /> Import .env
                                </Button>
                            </Layout.Stack>
                            {#if variables?.length}
                                <Button
                                    secondary
                                    size="s"
                                    on:mousedown={() => {
                                        showCreate = true;
                                        trackEvent(Click.VariablesCreateClick, {
                                            source: 'site_settings'
                                        });
                                    }}>
                                    <Icon slot="start" icon={IconPlus} /> Create variable
                                </Button>
                            {/if}
                        </Layout.Stack>

                        {#if variables?.length}
                            <Paginator
                                items={variables}
                                limit={6}
                                let:paginatedItems
                                hideFooter={variables.length <= 6}>
                                <Table.Root
                                    let:root
                                    columns={[
                                        { id: 'key', width: 200 },
                                        { id: 'value' },
                                        { id: 'actions', width: 40 }
                                    ]}>
                                    <svelte:fragment slot="header" let:root>
                                        <Table.Header.Cell column="key" {root}
                                            >Key</Table.Header.Cell>
                                        <Table.Header.Cell column="value" {root}
                                            >Value</Table.Header.Cell>
                                        <Table.Header.Cell column="actions" {root}
                                        ></Table.Header.Cell>
                                    </svelte:fragment>
                                    {#each paginatedItems as variable}
                                        <Table.Row.Base {root}>
                                            <Table.Cell column="key" {root}
                                                >{variable.key}</Table.Cell>
                                            <Table.Cell column="value" {root}>
                                                <!-- TODO: fix max width -->
                                                <div style="max-width: 20rem">
                                                    {#if variable.secret}
                                                        <Tooltip maxWidth="26rem">
                                                            <Badge
                                                                content="Secret"
                                                                variant="secondary"
                                                                size="s" />
                                                            <svelte:fragment slot="tooltip">
                                                                This value is secret, you cannot see
                                                                its value.
                                                            </svelte:fragment>
                                                        </Tooltip>
                                                    {:else}
                                                        <InteractiveText
                                                            variant="secret"
                                                            isVisible={false}
                                                            text={variable.value} />
                                                    {/if}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell column="actions" {root}>
                                                <div style="margin-inline-start: auto">
                                                    <Popover
                                                        padding="none"
                                                        placement="bottom-end"
                                                        let:toggle>
                                                        <PinkButton.Button
                                                            icon
                                                            variant="text"
                                                            size="s"
                                                            aria-label="More options"
                                                            on:click={(e) => {
                                                                e.preventDefault();
                                                                toggle(e);
                                                            }}>
                                                            <Icon
                                                                icon={IconDotsHorizontal}
                                                                size="s" />
                                                        </PinkButton.Button>

                                                        <svelte:fragment slot="tooltip" let:toggle>
                                                            <ActionMenu.Root>
                                                                {#if !variable?.secret}
                                                                    <ActionMenu.Item.Button
                                                                        leadingIcon={IconPencil}
                                                                        on:click={(e) => {
                                                                            toggle(e);
                                                                            currentVariable =
                                                                                variable;
                                                                            showUpdate = true;
                                                                        }}>
                                                                        Update
                                                                    </ActionMenu.Item.Button>
                                                                {/if}
                                                                {#if !variable?.secret}
                                                                    <ActionMenu.Item.Button
                                                                        leadingIcon={IconEyeOff}
                                                                        on:click={(e) => {
                                                                            toggle(e);

                                                                            currentVariable =
                                                                                variable;
                                                                            showSecretModal = true;
                                                                        }}>
                                                                        Secret
                                                                    </ActionMenu.Item.Button>
                                                                {/if}
                                                                <ActionMenu.Item.Button
                                                                    status="danger"
                                                                    leadingIcon={IconTrash}
                                                                    on:click={(e) => {
                                                                        toggle(e);
                                                                        currentVariable = variable;
                                                                        showDelete = true;
                                                                    }}>
                                                                    Delete
                                                                </ActionMenu.Item.Button>
                                                            </ActionMenu.Root>
                                                        </svelte:fragment>
                                                    </Popover>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row.Base>
                                    {/each}
                                </Table.Root>
                            </Paginator>
                        {:else}
                            <Empty on:click={() => (showCreate = true)}
                                >Create variables to get started</Empty>
                        {/if}
                    </Layout.Stack>
                </Layout.Stack>
            </Accordion>
        </Layout.Stack>
    </Layout.Stack>
</Fieldset>

{#if showEditorModal}
    <VariableEditorModal bind:variables bind:showEditor={showEditorModal} />
{/if}

{#if showSecretModal}
    <SecretVariableModal bind:show={showSecretModal} bind:currentVariable bind:variables />
{/if}

{#if showImportModal}
    <ImportSiteVariablesModal bind:show={showImportModal} bind:variables />
{/if}

{#if showCreate}
    <CreateVariableModal bind:show={showCreate} bind:variables />
{/if}
{#if showUpdate}
    <UpdateVariableModal bind:show={showUpdate} bind:variables bind:selectedVar={currentVariable} />
{/if}

{#if showDelete}
    <DeleteVariableModal bind:show={showDelete} bind:variables bind:currentVariable />
{/if}
