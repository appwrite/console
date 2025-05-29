<script lang="ts">
    import { Empty, Id } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { updateCommandGroupRanks } from '$lib/commandCenter';
    import { type Models } from '@appwrite.io/console';
    import FailedModal from './failedModal.svelte';
    import { canWriteWebhooks } from '$lib/stores/roles';
    import { Icon, Layout, Link, Status, Table } from '@appwrite.io/pink-svelte';
    import ViewSelector from '$lib/components/viewSelector.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { View } from '$lib/helpers/load';
    import { goto } from '$app/navigation';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data: PageData;

    let showFailed = false;
    let selectedWebhook: Models.Webhook;

    $: $updateCommandGroupRanks({ webhooks: 20, domains: 10 });
</script>

<svelte:head>
    <title>Webhooks - Appwrite</title>
</svelte:head>

<Container>
    <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
        <ViewSelector {columns} view={View.Table} hideView />
        {#if $canWriteWebhooks}
            <Button href={getProjectRoute('/settings/webhooks/create')} event="create_webhook">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create webhook
            </Button>
        {/if}
    </Layout.Stack>

    {#if data.webhooks.total}
        <Table.Root columns={$columns} let:root>
            <svelte:fragment slot="header" let:root>
                {#each $columns as { id, title }}
                    <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
                {/each}
            </svelte:fragment>
            {#each data.webhooks.webhooks as webhook}
                <Table.Row.Link {root} href={getProjectRoute(`/settings/webhooks/${webhook.$id}`)}>
                    {#each $columns as column (column.id)}
                        <Table.Cell column={column.id} {root}>
                            {#if column.id === '$id'}
                                {#key $columns}
                                    <Id value={webhook.$id}>{webhook.$id}</Id>
                                {/key}
                            {:else if column.id === 'events'}
                                {webhook.events.length}
                            {:else if column.type === 'datetime'}
                                {webhook[column.id] ? toLocaleDateTime(webhook[column.id]) : '-'}
                            {:else if column.id === 'enabled'}
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
                            {:else}
                                {webhook[column.id]}
                            {/if}
                        </Table.Cell>
                    {/each}
                </Table.Row.Link>
            {/each}
        </Table.Root>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/advanced/platform/webhooks"
            target="webhook"
            on:click={() => goto(getProjectRoute('/settings/webhooks/create'))} />
    {/if}
</Container>

<FailedModal bind:show={showFailed} bind:webhook={selectedWebhook} />
