<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCellHead,
        TableCellLink,
        TableCellText,
        TableHeader
    } from '$lib/elements/table';
    import { Container } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import Create from './createWebhook.svelte';

    function openWizard() {
        wizard.start(Create);
    }

    beforeNavigate(() => {
        wizard.hide();
    });

    const projectId = $page.params.project;
    const request = sdkForConsole.projects.listWebhooks(projectId);
</script>

<svelte:head>
    <title>Appwrite - Webhooks</title>
</svelte:head>
<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Webhooks</h2>

        <Button on:click={openWizard}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create webhook</span>
        </Button>
    </div>

    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <Table>
                <TableHeader>
                    <TableCellHead width={80}>Name</TableCellHead>
                    <TableCellHead>URL</TableCellHead>
                    <TableCellHead width={80}>Events</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each response.webhooks as webhook}
                        <TableCellLink
                            title="Name"
                            href={`${base}/console/project-${projectId}/webhooks/webhook/${webhook.$id}`}>
                            {webhook.name}
                        </TableCellLink>
                        <TableCellText title="URL">{webhook.url}</TableCellText>
                        <TableCellText title="Scopes">{webhook.events.length}</TableCellText>
                    {/each}
                </TableBody>
            </Table>
        {:else}
            <Empty isButton single>
                <div class="common-section u-text-center">
                    <p class="text">Create your first Webhook to get startedNeed a hand?</p>
                    <p class="text">Check out our documentation.</p>
                </div>
                <div class="u-flex u-gap-12 common-section">
                    <Button text href="#/">Documentation</Button>
                    <Button secondary on:click={openWizard}>
                        <span class="text">Create Webhook</span>
                    </Button>
                </div>
            </Empty>
        {/if}
    {/await}
</Container>
