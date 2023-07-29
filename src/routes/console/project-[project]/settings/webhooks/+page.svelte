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
    import LL from '$i18n/i18n-svelte';

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
    <title>{$LL.console.project.title.webhooks()} - Appwrite</title>
</svelte:head>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">{$LL.console.project.title.webhooks()}</Heading>
        <Button on:click={openWizard} event="create_webhook">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">{$LL.console.project.button.createWebhook()}</span>
        </Button>
    </div>

    {#if data.webhooks.total}
        <Table>
            <TableHeader>
                <TableCellHead>{$LL.console.project.table.header.name()}</TableCellHead>
                <TableCellHead>{$LL.console.project.table.header.postUrl()}</TableCellHead>
                <TableCellHead width={80}
                    >{$LL.console.project.table.header.events()}</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.webhooks.webhooks as webhook}
                    <TableRowLink
                        href={`${base}/console/project-${projectId}/settings/webhooks/${webhook.$id}`}>
                        <TableCell title="Name">
                            <div class="u-flex u-main-space-between">
                                {webhook.name}
                                {#if webhook.security === false}
                                    <Pill>{$LL.console.project.table.pill.sllTlsDisabled()}</Pill>
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
