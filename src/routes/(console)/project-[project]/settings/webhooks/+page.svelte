<script lang="ts" context="module">
    export function openWebhooksWizard() {
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
    import { Container, GridHeader } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { updateCommandGroupRanks } from '$lib/commandCenter';
    import { type Models } from '@appwrite.io/console';
    import Create from './createWebhook.svelte';
    import FailedModal from './failedModal.svelte';
    import MessageStatusPill from './messageStatusPill.svelte';

    export let data: PageData;

    let showFailed = false;
    let selectedWebhook: Models.Webhook;

    function openWizard() {
        wizard.start(Create);
    }

    const projectId = $page.params.project;

    $: $updateCommandGroupRanks({ webhooks: 20, domains: 10 });
</script>

<svelte:head>
    <title>Webhooks - Appwrite</title>
</svelte:head>

<Container>
    <GridHeader title="Webhooks" {columns} view={data.view} hideColumns={false} hideView={true}>
        <Button on:click={openWizard} event="create_webhook">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create webhook</span>
        </Button>
    </GridHeader>

    {#if data.webhooks.total}
        <TableScroll>
            <TableHeader>
                {#each $columns as column}
                    {#if column.show}
                        <TableCellHead width={column.width}>{column.title}</TableCellHead>
                    {/if}
                {/each}
            </TableHeader>
            <TableBody service="webhooks" total={data.webhooks.total}>
                {#each data.webhooks.webhooks as webhook}
                    <TableRowLink
                        href={`${base}/project-${projectId}/settings/webhooks/${webhook.$id}`}>
                        {#each $columns as column (column.id)}
                            {#if column.show}
                                {#if column.id === '$id'}
                                    {#key $columns}
                                        <TableCell title={column.title} width={column.width}>
                                            <Id value={webhook.$id}>{webhook.$id}</Id>
                                        </TableCell>
                                    {/key}
                                {:else if column.id === 'events'}
                                    <TableCellText title={column.title} width={column.width}>
                                        {webhook.events.length}
                                    </TableCellText>
                                {:else if column.type === 'datetime'}
                                    <TableCellText title={column.title} width={column.width}>
                                        {#if !webhook[column.id]}
                                            -
                                        {:else}
                                            {toLocaleDateTime(webhook[column.id])}
                                        {/if}
                                    </TableCellText>
                                {:else if column.id === 'enabled'}
                                    <TableCellText title={column.title} width={column.width}>
                                        <MessageStatusPill enabled={webhook.enabled} />

                                        &nbsp;

                                        {#if webhook.enabled === false}
                                            <Button
                                                link
                                                on:click={(e) => {
                                                    e.preventDefault();
                                                    selectedWebhook = webhook;
                                                    showFailed = true;
                                                }}>Details</Button>
                                        {/if}
                                    </TableCellText>
                                {:else}
                                    <TableCellText title={column.title} width={column.width}>
                                        {webhook[column.id]}
                                    </TableCellText>
                                {/if}
                            {/if}
                        {/each}
                    </TableRowLink>
                {/each}
            </TableBody>
        </TableScroll>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/advanced/platform/webhooks"
            target="webhook"
            on:click={openWizard} />
    {/if}
</Container>

<FailedModal bind:show={showFailed} bind:webhook={selectedWebhook} />
