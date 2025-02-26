<script lang="ts" context="module">
    export function openWebhooksWizard() {
        if (!get(canWriteWebhooks)) {
            return;
        }
        wizard.start(Create);
    }
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty, Id } from '$lib/components';
    import {
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCell,
        TableCellText,
        TableHeader,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { updateCommandGroupRanks } from '$lib/commandCenter';
    import { type Models } from '@appwrite.io/console';
    import Create from './createWebhook.svelte';
    import FailedModal from './failedModal.svelte';
    import MessageStatusPill from './messageStatusPill.svelte';
    import { canWriteWebhooks } from '$lib/stores/roles';
    import { get } from 'svelte/store';
    import { Badge, Icon, Layout, Link, Status, Table } from '@appwrite.io/pink-svelte';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { View } from '$lib/helpers/load';

    export let data: PageData;

    let showFailed = false;
    let selectedWebhook: Models.Webhook;

    function openWizard() {
        if (!$canWriteWebhooks) {
            return;
        }
        wizard.start(Create);
    }

    const projectId = $page.params.project;

    $: $updateCommandGroupRanks({ webhooks: 20, domains: 10 });
</script>

<svelte:head>
    <title>Webhooks - Appwrite</title>
</svelte:head>

<Container>
    <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
        <ViewSelector {columns} view={View.Table} hideView />
        {#if $canWriteWebhooks}
            <Button on:click={openWizard} event="create_webhook">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create webhook
            </Button>
        {/if}
    </Layout.Stack>

    {#if data.webhooks.total}
        <Table.Root>
            <svelte:fragment slot="header">
                {#each $columns as column}
                    {#if column.show}
                        <Table.Header.Cell width={column.width + 'px'}
                            >{column.title}</Table.Header.Cell>
                    {/if}
                {/each}
            </svelte:fragment>
            {#each data.webhooks.webhooks as webhook}
                <Table.Link href={`${base}/project-${projectId}/settings/webhooks/${webhook.$id}`}>
                    {#each $columns as column (column.id)}
                        {#if column.show}
                            {#if column.id === '$id'}
                                {#key $columns}
                                    <Table.Cell>
                                        <Id value={webhook.$id}>{webhook.$id}</Id>
                                    </Table.Cell>
                                {/key}
                            {:else if column.id === 'events'}
                                <Table.Cell>
                                    {webhook.events.length}
                                </Table.Cell>
                            {:else if column.type === 'datetime'}
                                <Table.Cell>
                                    {#if !webhook[column.id]}
                                        -
                                    {:else}
                                        {toLocaleDateTime(webhook[column.id])}
                                    {/if}
                                </Table.Cell>
                            {:else if column.id === 'enabled'}
                                <Table.Cell>
                                    <Layout.Stack direction="row" gap="s" alignItems="normal">
                                        <Status
                                            label={webhook.enabled ? 'Enabled' : 'Disabled'}
                                            status={webhook.enabled ? 'complete' : 'failed'} />

                                        {#if webhook.enabled === false}
                                            <Link.Button
                                                variant="muted"
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    selectedWebhook = webhook;
                                                    showFailed = true;
                                                }}>Details</Link.Button>
                                        {/if}
                                    </Layout.Stack>
                                </Table.Cell>
                            {:else}
                                <Table.Cell>
                                    {webhook[column.id]}
                                </Table.Cell>
                            {/if}
                        {/if}
                    {/each}
                </Table.Link>
            {/each}
        </Table.Root>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/advanced/platform/webhooks"
            target="webhook"
            on:click={openWizard} />
    {/if}
</Container>

<FailedModal bind:show={showFailed} bind:webhook={selectedWebhook} />
