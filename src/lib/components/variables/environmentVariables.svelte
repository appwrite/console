<script lang="ts">
    import { Empty, Paginator } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Accordion,
        Badge,
        InteractiveText,
        Icon,
        Layout,
        Skeleton,
        Table,
        Tooltip
    } from '@appwrite.io/pink-svelte';
    import {
        IconCode,
        IconUpload,
        IconPlus
    } from '@appwrite.io/pink-icons-svelte';
    import VariableActionMenu from './variableActionMenu.svelte';
    import type { Models } from '@appwrite.io/console';
    import VariableEditorModal from './variableEditorModal.svelte';
    import SecretVariableModal from './secretVariableModal.svelte';
    import ImportVariablesModal from './importVariablesModal.svelte';
    import CreateVariableModal, { type ProductLabel } from './createVariableModal.svelte';
    import DeleteVariableModal from './deleteVariableModal.svelte';
    import UpdateVariableModal from './updateVariableModal.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { isSmallViewport } from '$lib/stores/viewport';

    const DOCS_LINKS: Record<ProductLabel, string> = {
        site: 'https://appwrite.io/docs/products/sites/develop#accessing-environment-variables',
        function: 'https://appwrite.io/docs/products/functions/develop#environment-variables'
    };

    let {
        variables = $bindable([]),
        productLabel = 'site',
        analyticsSource = 'site_configuration',
        analyticsCreateSource = 'site_settings',
        isLoading = false
    }: {
        variables: Partial<Models.Variable>[];
        productLabel?: ProductLabel;
        analyticsSource?: string;
        analyticsCreateSource?: string;
        isLoading?: boolean;
    } = $props();

    let showEditorModal = $state(false);
    let showImportModal = $state(false);
    let showSecretModal = $state(false);
    let showCreate = $state(false);
    let showUpdate = $state(false);
    let showDelete = $state(false);
    let currentVariable = $state<Partial<Models.Variable>>(undefined);

    const createSource = $derived(analyticsCreateSource || analyticsSource);
    const docsLink = $derived(DOCS_LINKS[productLabel]);

    const tableColumns = $derived(
        $isSmallViewport
            ? [
                  { id: 'key', width: { min: 120, max: 300 } },
                  { id: 'value', width: { min: 100, max: 200 } },
                  { id: 'actions', width: 40 }
              ]
            : [
                  { id: 'key', width: { min: 280, max: 420 } },
                  { id: 'value', width: { min: 200, max: 400 } },
                  { id: 'actions', width: 50 }
              ]
    );
</script>

<Accordion title="Environment variables" badge="Optional" hideDivider>
    <Layout.Stack gap="xl">
        Set up environment variables to securely manage keys and settings for your project.
        <Layout.Stack gap="l">
            <Layout.Stack direction="row" gap="s">
                <Layout.Stack direction="row" gap="s">
                    <Button
                        secondary
                        size="s"
                        on:click={() => {
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
                        on:click={() => {
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
                        icon={$isSmallViewport}
                        on:click={() => {
                            showCreate = true;
                            trackEvent(Click.VariablesCreateClick, {
                                source: createSource
                            });
                        }}>
                        <Icon slot="start" icon={IconPlus} />
                        {#if !$isSmallViewport}Create variable{/if}
                    </Button>
                {/if}
            </Layout.Stack>

            {#if isLoading && !variables?.length}
                <Table.Root class="responsive-table" let:root columns={tableColumns}>
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
                        <Table.Root class="responsive-table" let:root columns={tableColumns}>
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
                                        <div style="max-width: 100%">
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
                                                    isVisible={true}
                                                    text={variable.value} />
                                            {/if}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell column="actions" {root}>
                                        <div style="margin-inline-start: auto">
                                            <VariableActionMenu
                                                {variable}
                                                onUpdate={() => {
                                                    currentVariable = variable;
                                                    showUpdate = true;
                                                }}
                                                onSecret={() => {
                                                    currentVariable = variable;
                                                    showSecretModal = true;
                                                }}
                                                onDelete={() => {
                                                    currentVariable = variable;
                                                    showDelete = true;
                                                }} />
                                        </div>
                                    </Table.Cell>
                                </Table.Row.Base>
                            {/each}
                        </Table.Root>
                    {/snippet}
                </Paginator>
            {:else}
                <Empty
                    on:click={() => {
                        showCreate = true;
                        trackEvent(Click.VariablesCreateClick, {
                            source: createSource
                        });
                    }}>Create variables to get started</Empty>
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
