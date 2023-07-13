<script lang="ts" context="module">
    export function openWebhooksWizard() {
        wizard.start(Create);
    }
</script>

<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import {
        Table,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCell,
        TableCellText,
        TableHeader
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { wizard } from '$lib/stores/wizard';
    import type { PageData } from './$types';
    import Create from './createWebhook.svelte';
    import Heading from '$lib/components/heading.svelte';
    import { updateCommandGroupRanks } from '$lib/commandCenter';

    export let data: PageData;

    function openWizard() {
        wizard.start(Create);
    }

    beforeNavigate(() => {
        wizard.hide();
    });

    const projectId = $page.params.project;

    $: $updateCommandGroupRanks((prev) => ({
        ...prev,
        webhooks: 20,
        domains: 10
    }));
</script>

<svelte:head>
    <title>Webhooks - Appwrite</title>
</svelte:head>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Webhooks</Heading>
        <Button on:click={openWizard} event="create_webhook">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create webhook</span>
        </Button>
    </div>

    {#if data.webhooks.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>POST URL</TableCellHead>
                <TableCellHead width={80}>Events</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.webhooks.webhooks as webhook}
                    <TableRowLink
                        href={`${base}/console/project-${projectId}/settings/webhooks/${webhook.$id}`}>
                        <TableCell title="Name">
                            <div class="u-flex u-main-space-between">
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
        </Table>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/webhooks"
            target="webhook"
            on:click={openWizard} />
    {/if}
</Container>
