<script lang="ts">
    import { Container } from '$lib/layout';
    import {
        ActionMenu,
        Card,
        Empty,
        Icon,
        InlineCode,
        Layout,
        Button as PinkButton,
        Popover,
        Tooltip
    } from '@appwrite.io/pink-svelte';
    import DomainMetrics from './domainMetrics.svelte';
    import { base } from '$app/paths';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { app } from '$lib/stores/app';
    import { Button } from '$lib/elements/forms';
    import {
        IconDownload,
        IconPlus,
        IconUpload,
        IconAdjustments
    } from '@appwrite.io/pink-icons-svelte';
    import DisplaySettingsModal from '$lib/layout/displaySettingsModal.svelte';
    import { ViewSelector } from '$lib/components';
    import { View } from '$lib/helpers/load';
    import { columns, presets } from './store';
    import CreateRecordModal from './createRecordModal.svelte';
    import Table from './table.svelte';
    import AddPresetModal from './addPresetModal.svelte';
    import ImportRecordModal from './importRecordModal.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import RetryDomainModal from '$routes/(console)/organization-[organization]/domains/retryDomainModal.svelte';

    export let data;

    let showRetry = false;
    let showCreate = false;
    let showPresetModal = false;
    let showImportModal = false;
    let showDisplaySettingsModal = false;
    let selectedPreset = '';

    async function downloadRecords() {
        try {
            const zone = await sdk.forConsole.domains.getZone({
                domainId: data.domain.$id
            });

            if ('message' in zone) {
                const blob = new Blob([zone.message as string], { type: 'text/plain' });

                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = `${data.domain.domain}.txt`;

                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(downloadLink.href);
            } else {
                throw new Error('Failed to download records');
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Container>
    <Layout.Stack gap="xxxl">
        <DomainMetrics domain={data.domain} retryVerification={() => (showRetry = true)} />

        <Layout.Stack gap="l">
            {#if data.recordList.total}
                {#if $isSmallViewport}
                    <Layout.Stack gap="s">
                        <div class="u-flex u-gap-8">
                            <div style="flex: 1">
                                <Popover let:toggle padding="none">
                                    <Button secondary fullWidth on:click={toggle}
                                        >Add preset</Button>
                                    <svelte:fragment slot="tooltip" let:toggle>
                                        <ActionMenu.Root>
                                            {#each presets as preset}
                                                <ActionMenu.Item.Button
                                                    on:click={(e) => {
                                                        toggle(e);
                                                        selectedPreset = preset;
                                                        showPresetModal = true;
                                                    }}>{preset}</ActionMenu.Item.Button>
                                            {/each}
                                        </ActionMenu.Root>
                                    </svelte:fragment>
                                </Popover>
                            </div>
                            <Button
                                secondary
                                icon
                                ariaLabel="Import zone file"
                                on:click={() => (showImportModal = true)}>
                                <Icon size="m" icon={IconUpload} />
                            </Button>
                            <Tooltip>
                                <PinkButton.Button
                                    variant="secondary"
                                    icon
                                    on:click={downloadRecords}>
                                    <Icon icon={IconDownload} size="m" />
                                </PinkButton.Button>
                                <svelte:fragment slot="tooltip">Export as .txt</svelte:fragment>
                            </Tooltip>
                            <Button
                                secondary
                                icon
                                ariaLabel="Display settings"
                                on:click={() => (showDisplaySettingsModal = true)}>
                                <Icon icon={IconAdjustments} />
                            </Button>
                        </div>
                        <Button fullWidth on:click={() => (showCreate = true)}>
                            <Icon size="s" icon={IconPlus} slot="start" />
                            Create record
                        </Button>
                    </Layout.Stack>
                {:else}
                    <Layout.Stack
                        direction="row"
                        gap="m"
                        justifyContent="space-between"
                        alignItems="center"
                        wrap="wrap">
                        <Layout.Stack
                            direction="row"
                            gap="s"
                            alignItems="center"
                            wrap="wrap"
                            style="flex: 1">
                            <Button secondary on:click={() => (showImportModal = true)}>
                                <Icon icon={IconUpload} size="s" slot="start" />
                                Import zone file
                            </Button>
                            <Tooltip>
                                <PinkButton.Button
                                    variant="secondary"
                                    icon
                                    on:click={downloadRecords}>
                                    <Icon icon={IconDownload} size="s" />
                                </PinkButton.Button>
                                <svelte:fragment slot="tooltip">Export as .txt</svelte:fragment>
                            </Tooltip>
                        </Layout.Stack>
                        <Layout.Stack
                            direction="row"
                            gap="s"
                            alignItems="center"
                            style="flex: 1; min-width: 250px; justify-content: flex-end;">
                            <ViewSelector ui="new" view={View.Table} {columns} hideView />

                            <Popover let:toggle padding="none">
                                <Button secondary on:click={toggle}>Add preset</Button>
                                <svelte:fragment slot="tooltip" let:toggle>
                                    <ActionMenu.Root>
                                        {#each presets as preset}
                                            <ActionMenu.Item.Button
                                                on:click={(e) => {
                                                    toggle(e);
                                                    selectedPreset = preset;
                                                    showPresetModal = true;
                                                }}>{preset}</ActionMenu.Item.Button>
                                        {/each}
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Popover>

                            <div>
                                <Button on:click={() => (showCreate = true)}>
                                    <Icon size="s" icon={IconPlus} slot="start" />
                                    Create record
                                </Button>
                            </div>
                        </Layout.Stack>
                    </Layout.Stack>
                {/if}
                <div class="responsive-table">
                    <Table {data} />
                </div>
            {:else}
                <Card.Base padding="none">
                    <Empty
                        src={$app.themeInUse === 'dark'
                            ? `${base}/images/domains/empty-records-dark.svg`
                            : `${base}/images/domains/empty-records-light.svg`}
                        title="Get started with Appwrite DNS">
                        <span slot="description">
                            Navigate to your domain provider and update the nameservers to <InlineCode
                                code="ns1.appwrite-dns.com"
                                size="s" /> and <InlineCode code="ns2.appwrite-dns.com" size="s" />.
                            Note that DNS changes may take time to propagate fully.
                        </span>
                        <svelte:fragment slot="actions">
                            <Button
                                external
                                href="#"
                                text
                                event="empty_documentation"
                                size="s"
                                ariaLabel="add domain">Documentation</Button>

                            <Button secondary size="s">Verify DNS setup</Button>
                        </svelte:fragment>
                    </Empty>
                </Card.Base>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Container>

{#if showCreate}
    <CreateRecordModal bind:show={showCreate} />
{/if}

{#if showPresetModal}
    <AddPresetModal bind:show={showPresetModal} {selectedPreset} />
{/if}

{#if showImportModal}
    <ImportRecordModal bind:show={showImportModal} />
{/if}

{#if showRetry}
    <RetryDomainModal bind:show={showRetry} selectedDomain={data.domain} />
{/if}

{#if showDisplaySettingsModal}
    <DisplaySettingsModal
        bind:show={showDisplaySettingsModal}
        {columns}
        hideView
        view={View.Table} />
{/if}

<style>
    .responsive-table {
        overflow: hidden;
        width: 100%;
        scrollbar-width: thin;
        position: relative;
    }
</style>
