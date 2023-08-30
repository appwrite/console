<script lang="ts" context="module">
    export function openWebhooksWizard() {
        wizard.start(Create);
    }
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty } from '$lib/components';
    import { Pill } from '$lib/elements';
    import {
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCell,
        TableCellText,
        TableHeader,
        TableScroll
    } from '$lib/elements/table';
    import { Container, ContainerHeader } from '$lib/layout';
    import { wizard } from '$lib/stores/wizard';
    import type { PageData } from './$types';
    import Create from './createWebhook.svelte';
    import { updateCommandGroupRanks } from '$lib/commandCenter';

    export let data: PageData;

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
    <ContainerHeader
        title="Webhooks"
        buttonText="Create webhook"
        buttonMethod={openWizard}
        buttonEvent="create_webhook"
        total={data.webhooks.total} />

    {#if data.webhooks.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={200}>Name</TableCellHead>
                <TableCellHead width={180}>POST URL</TableCellHead>
                <TableCellHead width={80}>Events</TableCellHead>
            </TableHeader>
            <TableBody service="webhooks" total={data.webhooks.total}>
                {#each data.webhooks.webhooks as webhook}
                    <TableRowLink
                        href={`${base}/console/project-${projectId}/settings/webhooks/${webhook.$id}`}>
                        <TableCell title="Name">
                            <div class="u-flex u-main-space-between u-cross-center">
                                {webhook.name}
                                {#if webhook.security === false}
                                    <Pill>SLL/TLS disabled</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="URL">{webhook.url}</TableCellText>
                        <TableCellText title="Scopes">{webhook.events.length} events</TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </TableScroll>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/webhooks"
            target="webhook"
            on:click={openWizard} />
    {/if}
</Container>
