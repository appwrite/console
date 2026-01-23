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
                <Layout.Stack direction="row" gap="s" alignItems="center" wrap="wrap">
                    <div style:order={$isSmallViewport ? 2 : undefined}>
                        <Button
                            secondary
                            icon={$isSmallViewport}
                            ariaLabel={$isSmallViewport ? 'Import zone file' : undefined}
                            on:click={() => (showImportModal = true)}>
                            {#if $isSmallViewport}
                                <Icon size="m" icon={IconUpload} />
                            {:else}
                                <Icon icon={IconUpload} size="s" slot="start" />
                                Import zone file
                            {/if}
                        </Button>
                    </div>

                    <div style:order={$isSmallViewport ? 3 : undefined}>
                        <Tooltip>
                            <PinkButton.Button variant="secondary" icon on:click={downloadRecords}>
                                <Icon icon={IconDownload} size={$isSmallViewport ? 'm' : 's'} />
                            </PinkButton.Button>
                            <svelte:fragment slot="tooltip">Export as .txt</svelte:fragment>
                        </Tooltip>
                    </div>

                    {#if !$isSmallViewport}
                        <div style="flex: 1"></div>
                    {/if}

                    <div style:order={$isSmallViewport ? 4 : undefined}>
                        {#if $isSmallViewport}
                            <Button
                                secondary
                                icon
                                ariaLabel="Display settings"
                                on:click={() => (showDisplaySettingsModal = true)}>
                                <Icon icon={IconAdjustments} />
                            </Button>
                        {:else}
                            <ViewSelector ui="new" view={View.Table} {columns} hideView />
                        {/if}
                    </div>

                    <div
                        style:order={$isSmallViewport ? 1 : undefined}
                        style:flex={$isSmallViewport ? 1 : undefined}>
                        <Popover let:toggle padding="none">
                            <Button secondary fullWidth={$isSmallViewport} on:click={toggle}
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

                    <div
                        style:order={$isSmallViewport ? 5 : undefined}
                        style:width={$isSmallViewport ? '100%' : undefined}>
                        <Button fullWidth={$isSmallViewport} on:click={() => (showCreate = true)}>
                            <Icon size="s" icon={IconPlus} slot="start" />
                            Create record
                        </Button>
                    </div>
                </Layout.Stack>
                <Table {data} />
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
