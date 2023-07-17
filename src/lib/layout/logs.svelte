<script lang="ts">
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { log } from '$lib/stores/logs';
    import { Alert, Code, Heading, Id, Status, Tab, Tabs } from '../components';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';
    import { header } from '$lib/stores/layout';
    import { TableCellText, TableList } from '$lib/elements/table';

    let selectedRequest = 'parameters';
    let selectedResponse = 'logs';
    let rawData: string;

    $: console.log($log.data);

    function isExecution(
        data: Models.Deployment | Models.Execution<any>
    ): data is Models.Execution<any> {
        if ('trigger' in data) {
            rawData = `${sdk.forConsole.client.config.endpoint}/functions/${$log.func.$id}/execution/${$log.data.$id}?mode=admin&project=${$page.params.project}`;
            return true;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            $log.show = false;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $log.data}
    <section class="cover-frame" data-private>
        <header class="cover-frame-header u-flex u-gap-16 u-main-space-between u-cross-center">
            <div class="u-flex u-gap-8 u-cross-center">
                <h1 class="body-text-1 u-bold">Function ID:</h1>
                <Id value={$log.func.$id}>{$log.func.$id}</Id>
            </div>
            <button
                on:click={() => ($log.show = false)}
                class="button is-text is-only-icon"
                style="--button-size:1.5rem;"
                aria-label="close popup">
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>

        {#if isExecution($log.data)}
            <div class="cover-frame-content u-flex u-flex-vertical">
                <div class="u-flex u-gap-16">
                    <div class="avatar is-size-large">
                        <img
                            height="28"
                            width="28"
                            src={`${base}/icons/${$app.themeInUse}/color/${
                                $log.func.runtime.split('-')[0]
                            }.svg`}
                            alt="technology" />
                    </div>
                    <div>
                        <h2 class="body-text-2 u-bold">Execution ID:</h2>
                        <Id value={$log.data.$id}>{$log.data.$id}</Id>
                    </div>
                    <ul>
                        <li class="text">
                            <b>Total duration: </b>
                            <time>
                                {calculateTime($log.data.duration)}
                            </time>
                        </li>
                        <li class="text">
                            <b>Cold-start duration:</b>
                            <time> ?? </time>
                        </li>
                        <li class="text">
                            <b>Created at:</b>
                            <time>
                                {toLocaleDateTime($log.data.$createdAt)}
                            </time>
                        </li>
                        <li class="text">
                            <b>Host:</b>
                            <span> ??</span>
                        </li>
                    </ul>
                    <div class="status u-margin-inline-start-auto">
                        <Status status={$log.data.status}>{$log.data.status}</Status>
                    </div>
                </div>

                <div class="theme-dark u-stretch u-margin-block-start-32 u-overflow-hidden">
                    <section class="code-panel">
                        <header
                            class="code-panel-header u-flex u-main-space-between u-width-full-line">
                            <div class="u-flex u-gap-24">
                                <div class="u-flex u-gap-16">
                                    <h4 class="u-bold">Method:</h4>
                                    <span>{$log.data.method}</span>
                                </div>
                                <div class="u-flex u-gap-16">
                                    <h4 class="u-bold">Path:</h4>
                                    <span>{$log.data.path}</span>
                                </div>
                            </div>

                            <p>Triggered by: <b>{$log.data.trigger}</b></p>
                        </header>
                        <div class="code-panel-content grid-1-2" style="u-grid">
                            <div class="grid-1-2-col-1 u-flex u-flex-vertical u-gap-16">
                                <Heading tag="h3" size="6">Request</Heading>
                                <div class="u-sep-block-end">
                                    <Tabs>
                                        <Tab
                                            selected={selectedRequest === 'parameters'}
                                            on:click={() => (selectedRequest = 'parameters')}>
                                            Parameters ({header?.parameters?.length ?? 0})
                                        </Tab>
                                        <Tab
                                            selected={selectedRequest === 'headers'}
                                            on:click={() => (selectedRequest = 'headers')}>
                                            Headers ({header?.headers?.length ?? 0})
                                        </Tab>
                                        <Tab
                                            selected={selectedRequest === 'body'}
                                            on:click={() => (selectedRequest = 'body')}>
                                            Body
                                        </Tab>
                                    </Tabs>
                                </div>
                                {#if selectedRequest === 'parameters'}
                                    {#if $log.data.headers?.parameters?.length}
                                        <TableList>
                                            {#each $log.data.headers.parameters as params}
                                                <li class="table-row">
                                                    <TableCellText title="name">
                                                        {params.name}
                                                    </TableCellText>
                                                    <TableCellText title="value">
                                                        {params.value}
                                                    </TableCellText>
                                                </li>
                                            {/each}
                                        </TableList>
                                    {:else}
                                        <Alert type="info">
                                            <svelte:fragment slot="title">
                                                Parameters data is not stored in function executions
                                            </svelte:fragment>
                                            <p class="text">
                                                Logging parameters data might compromise privacy and
                                                security. To log them intentionally, use <b
                                                    >context.log(context.req.headers)</b>
                                                in your function and make them available in Logs tab.
                                                <a
                                                    href="http://#"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="link">Learn more</a
                                                >.
                                            </p>
                                        </Alert>
                                    {/if}
                                {:else if (selectedRequest = 'headers')}
                                    {#if $log.data.headers?.headers?.length}
                                        <TableList>
                                            {#each $log.data.headers.headers as params}
                                                <li class="table-row">
                                                    <TableCellText title="name">
                                                        {params.name}
                                                    </TableCellText>
                                                    <TableCellText title="value">
                                                        {params.value}
                                                    </TableCellText>
                                                </li>
                                            {/each}
                                        </TableList>
                                    {:else}
                                        <Alert type="info">
                                            <svelte:fragment slot="title">
                                                Header data is not stored in function executions
                                            </svelte:fragment>
                                            <p class="text">
                                                Logging header data might compromise privacy and
                                                security. To log them intentionally, use <b
                                                    >context.log(context.req.headers)</b>
                                                in your function and make them available in Logs tab.
                                                <a
                                                    href="http://#"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="link">Learn more</a
                                                >.
                                            </p>
                                        </Alert>
                                    {/if}
                                {:else if (selectedRequest = 'body')}
                                    {#if $log.data.headers?.body?.length}
                                        <Code withCopy noMargin code={$log.data.body} lang="sh" />
                                    {:else}
                                        <Alert type="info">
                                            <svelte:fragment slot="title">
                                                Body data is not stored in function executions
                                            </svelte:fragment>
                                            <p class="text">
                                                Logging body data might compromise privacy and
                                                security. To log them intentionally, use <b
                                                    >context.log()</b>
                                                in your function and make them available in Logs tab.
                                                <a
                                                    href="http://#"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="link">Learn more</a
                                                >.
                                            </p>
                                        </Alert>
                                    {/if}{/if}
                            </div>
                            <div class="grid-1-2-col-2 u-flex u-flex-vertical u-gap-16">
                                <Heading tag="h3" size="6">Response</Heading>
                                <div class="u-sep-block-end">
                                    <Tabs>
                                        <Tab
                                            selected={selectedResponse === 'logs'}
                                            on:click={() => (selectedResponse = 'logs')}>
                                            Logs
                                        </Tab>
                                        <Tab
                                            selected={selectedResponse === 'errors'}
                                            on:click={() => (selectedResponse = 'errors')}>
                                            Errors
                                        </Tab>
                                        <Tab
                                            selected={selectedResponse === 'headers'}
                                            on:click={() => (selectedResponse = 'headers')}>
                                            Headers
                                        </Tab>
                                        <Tab
                                            selected={selectedResponse === 'body'}
                                            on:click={() => (selectedResponse = 'body')}>
                                            Body
                                        </Tab>
                                    </Tabs>
                                </div>
                                {#if selectedResponse === 'logs'}
                                    <Code withCopy noMargin code={$log.data.logs} lang="sh" />
                                {:else if selectedResponse === 'errors'}
                                    <Code withCopy noMargin code={$log.data.errors} lang="sh" />
                                {:else if selectedResponse === 'headers'}
                                    {#if $log.data.headers?.length}
                                        <Code
                                            withCopy
                                            noMargin
                                            code={$log.data.headers}
                                            lang="sh" />
                                    {:else}
                                        <Alert type="info">
                                            <svelte:fragment slot="title">
                                                Header data is not stored in function executions
                                            </svelte:fragment>
                                            <p class="text">
                                                Logging header data might compromise privacy and
                                                security. To log them intentionally, use <b
                                                    >context.log()</b>
                                                in your function and make them available in Logs tab.
                                                <a
                                                    href="http://#"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="link">Learn more</a
                                                >.
                                            </p>
                                        </Alert>
                                    {/if}
                                {:else if selectedResponse === 'body'}
                                    {#if $log.data.body?.length}
                                        <Code withCopy noMargin code={$log.data.body} lang="sh" />
                                    {:else}
                                        <Alert type="info">
                                            <svelte:fragment slot="title">
                                                Body data is not stored in function executions
                                            </svelte:fragment>
                                            <p class="text">
                                                Logging body data might compromise privacy and
                                                security. To log them intentionally, use <b
                                                    >context.log()</b>
                                                in your function and make them available in Logs tab.
                                                <a
                                                    href="http://#"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    class="link">Learn more</a
                                                >.
                                            </p>
                                        </Alert>
                                    {/if}
                                {/if}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        {/if}
    </section>
{/if}
