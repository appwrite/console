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

    export let data: PageData;

    function openWizard() {
        wizard.start(Create);
    }

    beforeNavigate(() => {
        wizard.hide();
    });

    const projectId = $page.params.project;
</script>

<svelte:head>
    <title>Webhooks - Appwrite</title>
</svelte:head>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Webhooks</Heading>
        <Button on:click={openWizard}>
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
        <Empty single>
            <div class="common-section u-text-center">
                <p class="text u-line-height-1-5">
                    Create your first Webhook to get startedNeed a hand?
                </p>
                <p class="text u-line-height-1-5">Check out our documentation.</p>
            </div>
            <div class="u-flex u-gap-16 common-section">
                <Button text href="https://appwrite.io/docs/webhooks">Documentation</Button>
                <Button secondary on:click={openWizard}>
                    <span class="text">Create Webhook</span>
                </Button>
            </div>
        </Empty>
    {/if}
</Container>
