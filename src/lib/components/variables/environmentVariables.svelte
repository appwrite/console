<script lang="ts">
    import { Empty, Paginator } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        ActionMenu,
        Accordion,
        Badge,
        InteractiveText,
        Icon,
        Layout,
        Popover,
        Skeleton,
        Table,
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
    import VariableEditorModal from './variableEditorModal.svelte';
    import SecretVariableModal from './secretVariableModal.svelte';
    import ImportVariablesModal from './importVariablesModal.svelte';
    import CreateVariableModal from './createVariableModal.svelte';
    import DeleteVariableModal from './deleteVariableModal.svelte';
    import UpdateVariableModal from './updateVariableModal.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export let variables: Partial<Models.Variable>[] = [];
    export let productLabel = 'site';
    export let docsLink =
        'https://appwrite.io/docs/products/sites/develop#accessing-environment-variables';
    export let analyticsSource = 'site_configuration';
    export let analyticsCreateSource = 'site_settings';
    export let isLoading = false;

    let showEditorModal = false;
    let showImportModal = false;
    let showSecretModal = false;
    let showCreate = false;
    let showUpdate = false;
    let showDelete = false;

    let currentVariable: Partial<Models.Variable>;

    $: createSource = analyticsCreateSource || analyticsSource;
</script>

<Accordion title="Environment variables" badge="Optional" hideDivider>
    <Layout.Stack gap="xl">
        Set up environment variables to securely manage keys and settings for your project.
        <Layout.Stack gap="l">
            <Layout.Stack direction="row">
                <Layout.Stack direction="row" gap="s">
                    <Button
                        secondary
                        size="s"
                        on:mousedown={() => {
                            showEditorModal = true;
                            trackEvent(Click.VariablesUpdateClick, {
                                source: analyticsSource
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
                                source: analyticsSource
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
                                source: createSource
                            });
                        }}>
                        <Icon slot="start" icon={IconPlus} /> Create variable
                    </Button>
                {/if}
            </Layout.Stack>

            {#if isLoading && !variables?.length}
                <Table.Root
                    let:root
                    columns={[
                        { id: 'key', width: 200 },
                        { id: 'value' },
                        { id: 'actions', width: 40 }
                    ]}>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="key" {root}>Key</Table.Header.Cell>
                        <Table.Header.Cell column="value" {root}>Value</Table.Header.Cell>
                        <Table.Header.Cell column="actions" {root}></Table.Header.Cell>
                    </svelte:fragment>
                    {#each Array(3) as _}
                        <Table.Row.Base {root}>
                            <Table.Cell column="key" {root}>
                                <Skeleton variant="line" width={120} height={14} />
                            </Table.Cell>
                            <Table.Cell column="value" {root}>
                                <Skeleton variant="line" width="100%" height={14} />
                            </Table.Cell>
                            <Table.Cell column="actions" {root}>
                                <Skeleton variant="line" width={24} height={14} />
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
            {:else if variables?.length}
                <Paginator items={variables} limit={6} hideFooter={variables.length <= 6}>
                    {#snippet children(paginatedItems)}
                        <Table.Root
                            let:root
                            columns={[
                                { id: 'key', width: 200 },
                                { id: 'value' },
                                { id: 'actions', width: 40 }
                            ]}>
                            <svelte:fragment slot="header" let:root>
                                <Table.Header.Cell column="key" {root}>Key</Table.Header.Cell>
                                <Table.Header.Cell column="value" {root}>Value</Table.Header.Cell>
                                <Table.Header.Cell column="actions" {root}></Table.Header.Cell>
                            </svelte:fragment>
                            {#each paginatedItems as variable}
                                <Table.Row.Base {root}>
                                    <Table.Cell column="key" {root}>{variable.key}</Table.Cell>
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
                                                        This value is secret, you cannot see its
                                                        value.
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
                                                    <Icon icon={IconDotsHorizontal} size="s" />
                                                </PinkButton.Button>

                                                <svelte:fragment slot="tooltip" let:toggle>
                                                    <ActionMenu.Root>
                                                        {#if !variable?.secret}
                                                            <ActionMenu.Item.Button
                                                                leadingIcon={IconPencil}
                                                                on:click={(e) => {
                                                                    toggle(e);
                                                                    currentVariable = variable;
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
                                                                    currentVariable = variable;
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
                    {/snippet}
                </Paginator>
            {:else}
                <Empty on:click={() => (showCreate = true)}>Create variables to get started</Empty>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Accordion>

{#if showEditorModal}
    <VariableEditorModal bind:variables bind:showEditor={showEditorModal} {docsLink} />
{/if}

{#if showSecretModal}
    <SecretVariableModal bind:show={showSecretModal} bind:currentVariable bind:variables />
{/if}

{#if showImportModal}
    <ImportVariablesModal bind:show={showImportModal} bind:variables />
{/if}

{#if showCreate}
    <CreateVariableModal bind:show={showCreate} bind:variables {productLabel} />
{/if}
{#if showUpdate}
    <UpdateVariableModal
        bind:show={showUpdate}
        bind:variables
        bind:selectedVar={currentVariable}
        {productLabel} />
{/if}

{#if showDelete}
    <DeleteVariableModal bind:show={showDelete} bind:variables bind:currentVariable />
{/if}
