<script lang="ts">
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { log } from '$lib/stores/logs';
    import { Alert, Code, Heading, Id, Status, Tab, Tabs } from '../components';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { TableCellText, TableList } from '$lib/elements/table';
    import { beforeNavigate } from '$app/navigation';

    let selectedRequest = 'parameters';
    let selectedResponse = 'logs';

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            $log.show = false;
        }
    }

    beforeNavigate((n) => {
        if ($log.show) {
            if (n.type === 'popstate') {
                n.cancel();
            }
            $log.show = false;
        }
    });

    $: execution = $log.data;
    $: func = $log.func;
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
                        <b>Total duration: </b>
                        <time>
                            {calculateTime(execution.duration)}
                        </time>
                    </li>
                    <!-- <li class="text">
                            <b>Cold-start duration:</b>
                            <time> ?? </time>
                        </li> -->
                    <li class="text">
                        <b>Created at:</b>
                        <time>
                            {toLocaleDateTime(execution.$createdAt)}
                        </time>
                    </li>
                    <!-- <li class="text">
                            <b>Host:</b>
                            <span> ??</span>
                        </li> -->
                </ul>
                <div class="status u-margin-inline-start-auto">
                    <Status status={execution.status}>{execution.status}</Status>
                </div>
            </div>

            <div class="theme-dark u-stretch u-margin-block-start-32 u-overflow-hidden">
                <section class="code-panel">
                    <header class="code-panel-header u-flex u-main-space-between u-width-full-line">
                        <div class="u-flex u-gap-24">
                            <div class="u-flex u-gap-16">
                                <h4 class="u-bold">Method:</h4>
                                <span>{execution.requestMethod}</span>
                            </div>
                            <div class="u-flex u-gap-16">
                                <h4 class="u-bold">Path:</h4>
                                <span>{execution.requestPath}</span>
                            </div>
                        </div>

                        <p>Triggered by: <b>{execution.trigger}</b></p>
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
                            {:else if selectedRequest === 'headers'}
                                {@const headers = Object.entries(execution?.responseHeaders)}
                                {#if headers.length}
                                    <TableList>
                                        {#each headers as [key, value]}
                                            <li class="table-row">
                                                <TableCellText title="name">
                                                    {key}
                                                </TableCellText>
                                                <TableCellText title="value">
                                                    {value}
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
                            {:else if selectedRequest === 'body'}
                                {#if execution.responseBody.length}
                                    <Code
                                        withCopy
                                        noMargin
                                        code={execution.responseBody}
                                        language="sh" />
                                {:else}
                                    <Alert type="info">
                                        <svelte:fragment slot="title">
                                            Body data is not stored in function executions
                                        </svelte:fragment>
                                        <p class="text">
                                            Logging body data might compromise privacy and security.
                                            To log them intentionally, use <b>context.log()</b>
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
                                <Code withCopy noMargin code={execution.logs} language="sh" />
                            {:else if selectedResponse === 'errors'}
                                <Code withCopy noMargin code={execution.errors} language="sh" />
                            {:else if selectedResponse === 'headers'}
                                <Alert type="info">
                                    <svelte:fragment slot="title">
                                        Header data is not stored in function executions
                                    </svelte:fragment>
                                    <p class="text">
                                        Logging header data might compromise privacy and security.
                                        To log them intentionally, use <b>context.log()</b>
                                        in your function and make them available in Logs tab.
                                        <a
                                            href="http://#"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="link">Learn more</a
                                        >.
                                    </p>
                                </Alert>
                            {:else if selectedResponse === 'body'}
                                <Alert type="info">
                                    <svelte:fragment slot="title">
                                        Body data is not stored in function executions
                                    </svelte:fragment>
                                    <p class="text">
                                        Logging body data might compromise privacy and security. To
                                        log them intentionally, use <b>context.log()</b>
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
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </section>
{/if}
