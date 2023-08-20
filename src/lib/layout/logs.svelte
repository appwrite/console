<script lang="ts">
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { log } from '$lib/stores/logs';
    import { Alert, Card, Code, Heading, Id, Tab, Tabs } from '../components';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import {
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { beforeNavigate } from '$app/navigation';
    import Table from '$lib/elements/table/table.svelte';
    import { Pill } from '$lib/elements';

    let selectedRequest = 'parameters';
    let selectedResponse = 'logs';

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            $log.show = false;
        }
    }

    function parseUrl(url: string) {
        if (!url) return;
        const queryString = url.includes('?') ? url.split('?')[1] : '';
        const queries: Record<string, string>[] = [];
        for (const param of queryString.split('&')) {
            let [key, ...valueArr] = param.split('=');
            const value = valueArr.join('=');

            if (key) {
                queries.push({ key, value: value ?? '' });
            }
        }
        return queries;
    }

    beforeNavigate((n) => {
        if (!$log.show) return;
        if (n.type === 'popstate') {
            n.cancel();
        }
        $log.show = false;
    });

    $: parameters = parseUrl(execution?.requestPath);
    $: execution = $log.data;
    $: func = $log.func;
    $: if (execution?.errors) {
        selectedResponse = 'errors';
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if execution}
    <section class="cover-frame" data-private>
        <header class="cover-frame-header u-flex u-gap-16 u-main-space-between u-cross-center">
            <div class="u-flex u-gap-8 u-cross-center">
                <h1 class="body-text-1 u-bold">Function ID:</h1>
                <Id value={func.$id}>{func.$id}</Id>
            </div>
            <button
                on:click={() => ($log.show = false)}
                class="button is-text is-only-icon"
                style="--button-size:1.5rem;"
                aria-label="close popup">
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>

        <div class="cover-frame-content u-flex u-flex-vertical">
            <div class="u-flex u-gap-16">
                <div class="avatar is-size-large">
                    <img
                        height="28"
                        width="28"
                        src={`${base}/icons/${$app.themeInUse}/color/${
                            func.runtime.split('-')[0]
                        }.svg`}
                        alt="technology" />
                </div>
                <div>
                    <h2 class="body-text-2 u-bold">Execution ID:</h2>
                    <Id value={execution.$id}>{execution.$id}</Id>
                </div>
                <ul>
                    <li class="text">
                        <b>Duration: </b>
                        <time>
                            {calculateTime(execution.duration)}
                        </time>
                    </li>

                    <li class="text">
                        <b>Created at:</b>
                        <time>
                            {toLocaleDateTime(execution.$createdAt)}
                        </time>
                    </li>
                    {#if execution?.requestHeaders?.host}
                        <li class="text">
                            <b>Host</b>
                            <span>
                                {execution.requestHeaders.host}
                            </span>
                        </li>
                    {/if}
                </ul>
                <div class="status u-margin-inline-start-auto">
                    <Pill
                        warning={execution.status === 'waiting'}
                        danger={execution.status === 'failed'}
                        success={execution.status === 'completed' || execution.status === 'ready'}
                        info={execution.status === 'processing' || execution.status === 'building'}>
                        {execution.status}
                    </Pill>
                </div>
            </div>

            <div class="theme-dark u-stretch u-margin-block-start-32 u-overflow-hidden">
                <section class="code-panel">
                    <header class="code-panel-header u-flex u-main-space-between u-width-full-line">
                        <div class="u-flex u-gap-24">
                            <div class="u-flex u-gap-16">
                                <h4 class="text u-bold">Method:</h4>
                                <span class="u-text-color-gray">{execution.requestMethod}</span>
                            </div>
                            <div class="u-flex u-gap-16">
                                <h4 class="text u-bold">Path:</h4>
                                <span class="u-text-color-gray">{execution.requestPath}</span>
                            </div>
                        </div>

                        <div class="u-flex u-gap-24">
                            <div class="u-flex u-gap-16">
                                <h4 class="text u-bold">Triggered by:</h4>
                                <span class="u-text-color-gray">{execution.trigger}</span>
                            </div>
                            <div class="u-flex u-gap-16">
                                <h4 class="text u-bold">Status Code:</h4>
                                <span class="u-text-color-gray"
                                    >{execution.responseStatusCode}</span>
                            </div>
                        </div>
                    </header>
                    <div class="code-panel-content grid-1-2" style="u-grid">
                        <div class="grid-1-2-col-1 u-flex u-flex-vertical u-gap-16">
                            <Heading tag="h3" size="6">Request</Heading>
                            <div class="u-sep-block-end">
                                <Tabs>
                                    <Tab
                                        selected={selectedRequest === 'parameters'}
                                        on:click={() => (selectedRequest = 'parameters')}>
                                        Parameters
                                    </Tab>
                                    <Tab
                                        selected={selectedRequest === 'headers'}
                                        on:click={() => (selectedRequest = 'headers')}>
                                        Headers
                                    </Tab>
                                    <Tab
                                        selected={selectedRequest === 'body'}
                                        on:click={() => (selectedRequest = 'body')}>
                                        Body
                                    </Tab>
                                </Tabs>
                            </div>
                            {#if selectedRequest === 'parameters'}
                                {#if parameters?.length}
                                    <div class="u-margin-block-start-24">
                                        <Table noStyles noMargin>
                                            <TableHeader>
                                                <TableCellHead>Name</TableCellHead>
                                                <TableCellHead>Value</TableCellHead>
                                            </TableHeader>
                                            <TableBody>
                                                {#each parameters as param}
                                                    <TableRow>
                                                        <TableCellText title="Key">
                                                            {param.key}
                                                        </TableCellText>
                                                        <TableCellText title="Value">
                                                            {param.value}
                                                        </TableCellText>
                                                    </TableRow>
                                                {/each}
                                            </TableBody>
                                        </Table>
                                    </div>
                                {:else}
                                    <Card isDashed isTile>
                                        <p class="text u-text-center">
                                            Logging parameters data might compromise privacy and
                                            security. To log them intentionally, use <b
                                                >context.log(context.req.headers)</b
                                            >.
                                            <a
                                                href="http://#"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="link">Learn more</a
                                            >.
                                        </p>
                                    </Card>
                                {/if}
                            {:else if selectedRequest === 'headers'}
                                {#if execution.requestHeaders.length}
                                    <div class="u-margin-block-start-24">
                                        <Table noStyles noMargin>
                                            <TableHeader>
                                                <TableCellHead>Name</TableCellHead>
                                                <TableCellHead>Value</TableCellHead>
                                            </TableHeader>
                                            <TableBody>
                                                {#each execution.requestHeaders as header}
                                                    <TableRow>
                                                        <TableCellText title="Name">
                                                            {header.name}
                                                        </TableCellText>
                                                        <TableCellText title="Value">
                                                            {header.value}
                                                        </TableCellText>
                                                    </TableRow>
                                                {/each}
                                            </TableBody>
                                        </Table>
                                    </div>
                                {:else}
                                    <Card isDashed isTile>
                                        <p class="text u-text-center">
                                            Header data is not captured by Appwrite for your user's
                                            security and privacy. To log data intentionally, use <b
                                                >context.log()</b
                                            >.
                                            <a
                                                href="http://#"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="link">Learn more</a
                                            >.
                                        </p>
                                    </Card>
                                {/if}
                            {:else if selectedRequest === 'body'}
                                <Card isDashed isTile>
                                    <p class="text u-text-center">
                                        Logging body might compromise privacy and security. To log
                                        it intentionally, use <b>context.log()</b>.
                                        <a
                                            href="http://#"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="link">Learn more</a
                                        >.
                                    </p>
                                </Card>
                            {/if}
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
                                {#if execution?.logs}
                                    <Code withCopy noMargin code={execution.logs} language="sh" />
                                {:else}
                                    <Card isDashed isTile>
                                        <p class="text u-text-center">No response was recorded.</p>
                                    </Card>
                                {/if}
                            {:else if selectedResponse === 'errors'}
                                {#if execution?.errors}
                                    <Code withCopy noMargin code={execution.errors} language="sh" />
                                {:else}
                                    <Card isDashed isTile>
                                        <p class="text u-text-center">No response was recorded.</p>
                                    </Card>
                                {/if}
                            {:else if selectedResponse === 'headers'}
                                {#if execution.responseHeaders.length}
                                    <Table noMargin noStyles>
                                        <TableHeader>
                                            <TableCellHead>Name</TableCellHead>
                                            <TableCellHead>Value</TableCellHead>
                                        </TableHeader>
                                        <TableBody>
                                            {#each execution.responseHeaders as header}
                                                <TableRow>
                                                    <TableCellText title="Name">
                                                        {header.name}
                                                    </TableCellText>
                                                    <TableCellText title="Value"
                                                        >{header.value}</TableCellText>
                                                </TableRow>
                                            {/each}
                                        </TableBody>
                                    </Table>
                                {:else}
                                    <Card isDashed isTile>
                                        <p class="text u-text-center">
                                            Logging some headers might compromise privacy and
                                            security. We only log well-known public headers. To log
                                            more headers intentionally, use <b>context.log()</b>.
                                            <a
                                                href="http://#"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="link">Learn more</a
                                            >.
                                        </p>
                                    </Card>
                                {/if}
                            {:else if selectedResponse === 'body'}
                                <Card isDashed isTile>
                                    <p class="text u-text-center">
                                        Logging body might compromise privacy and security. To log
                                        it intentionally, use <b>context.log()</b>.
                                        <a
                                            href="http://#"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="link">Learn more</a
                                        >.
                                    </p>
                                </Card>
                            {/if}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </section>
{/if}
