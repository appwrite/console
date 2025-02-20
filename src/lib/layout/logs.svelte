<script lang="ts">
    import { hoursToDays, timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { log } from '$lib/stores/logs';
    import { Alert, Card, Code, Copy, Heading, Id, SvgIcon, Tab, Tabs } from '../components';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import {
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { beforeNavigate } from '$app/navigation';
    import { Pill } from '$lib/elements';
    import { isCloud } from '$lib/system';
    import { getServiceLimit, tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { BillingPlan } from '$lib/constants';
    import { tooltip } from '$lib/actions/tooltip';

    let selectedRequest = 'parameters';
    let selectedResponse = 'logs';

    const limit = getServiceLimit('logs');
    const tier = tierToPlan($organization?.billingPlan)?.name;

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

    function unescapeNewLines(logs: string) {
        return logs.replace(/\\n/g, '\n');
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
    $: host = execution?.requestHeaders?.find((header) => header.name === 'host')?.value;
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
            <div class="grid-1-2">
                <div class="grid-1-2-col-1">
                    <div class="u-flex u-gap-16">
                        <div class="avatar is-size-large">
                            <SvgIcon
                                size={56}
                                type="color"
                                name={func.runtime.split('-')[0]}
                                iconSize="large" />
                        </div>
                        <div class="u-grid-equal-row-size u-gap-4 u-line-height-1">
                            <h2 class="body-text-2 u-bold">Execution ID:</h2>
                            <Id value={execution.$id}>{execution.$id}</Id>
                        </div>
                    </div>
                </div>
                <div class="grid-1-2-col-2 u-flex u-main-space-between">
                    <ul class="u-grid-equal-row-size u-gap-4 u-line-height-1">
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
                        {#if host}
                            <li class="text">
                                <b>Host:</b>
                                <span>
                                    {host}
                                </span>
                            </li>
                        {/if}
                    </ul>
                    <div class="status u-margin-inline-start-auto">
                        <div
                            use:tooltip={{
                                content: `Scheduled to execute on ${toLocaleDateTime(execution.scheduledAt)}`,
                                disabled:
                                    !execution?.scheduledAt || execution.status !== 'scheduled',
                                maxWidth: 180
                            }}>
                            <Pill
                                warning={execution.status === 'waiting' ||
                                    execution.status === 'building'}
                                danger={execution.status === 'failed'}
                                info={execution.status === 'completed' ||
                                    execution.status === 'ready'}>
                                {#if execution.status === 'scheduled'}
                                    <span class="icon-clock" aria-hidden="true" />
                                    {timeFromNow(execution.scheduledAt)}
                                {:else}
                                    {execution.status}
                                {/if}
                            </Pill>
                        </div>
                    </div>
                </div>
            </div>

            <div class="u-stretch u-margin-block-start-32 u-overflow-hidden">
                <section class="code-panel">
                    <header
                        class="code-panel-header code-panel-compact-header u-main-space-between u-width-full-line">
                        <div class="u-flex">
                            <div class="u-flex u-gap-16">
                                <h4 class="text u-bold">Method:</h4>
                                <span class="u-text-color-gray">{execution.requestMethod}</span>
                            </div>
                            <div class="u-flex u-gap-16">
                                <h4 class="text u-bold">Path:</h4>

                                <Copy value={execution.requestPath}>
                                    <div
                                        class="interactive-text-output is-textarea"
                                        style:min-inline-size="0">
                                        <span class="text u-line-height-1-5 u-break-all">
                                            {execution.requestPath}
                                        </span>
                                        <div class="u-flex u-cross-child-start u-gap-8">
                                            <button
                                                class="interactive-text-output-button"
                                                aria-label="copy text">
                                                <span class="icon-duplicate" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </Copy>
                            </div>
                        </div>

                        <div class="u-flex u-gap-24">
                            <div class="u-flex u-gap-16">
                                <h4 class="text u-bold">Triggered by:</h4>
                                <span class="u-text-color-gray">{execution.trigger}</span>
                            </div>
                            <div class="u-flex u-gap-16">
                                <h4 class="text u-bold">Status Code:</h4>
                                <span class="u-text-color-gray">
                                    {execution.responseStatusCode}
                                </span>
                            </div>
                        </div>
                    </header>
                    <div class="code-panel-content grid-1-2">
                        <div
                            class="grid-1-2-col-1 u-flex u-flex-vertical u-gap-16 mobile-only-inline-20-padding">
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
                                        <TableScroll noMargin>
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
                                        </TableScroll>
                                    </div>
                                {/if}

                                <p class="text u-text-center u-padding-24">
                                    {parameters?.length
                                        ? 'Not all parameters data is'
                                        : 'Parameters data is not'} captured by Appwrite for your user's
                                    security and privacy. To display parameters data in the Logs tab,
                                    use
                                    <b>context.log()</b>.
                                    <a
                                        href="https://appwrite.io/docs/products/functions/development#logging"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="link">Learn more</a
                                    >.
                                </p>
                            {:else if selectedRequest === 'headers'}
                                {#if execution.requestHeaders.length}
                                    <div class="u-margin-block-start-24">
                                        <TableScroll noMargin>
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
                                        </TableScroll>
                                    </div>
                                {/if}

                                <p class="text u-text-center u-padding-16">
                                    {execution.requestHeaders?.length
                                        ? 'Not all header data is'
                                        : 'Header data is not'}
                                    captured by Appwrite for your user's security and privacy. To display
                                    header data in the Logs tab, use
                                    <b>context.log()</b>.
                                    <a
                                        href="https://appwrite.io/docs/products/functions/development#logging"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="link">Learn more</a
                                    >.
                                </p>
                            {:else if selectedRequest === 'body'}
                                <p class="text u-text-center u-padding-16">
                                    Body data is not captured by Appwrite for your user's security
                                    and privacy. To display body data in the Logs tab, use
                                    <b>context.log()</b>.
                                    <a
                                        href="https://appwrite.io/docs/products/functions/development#logging"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="link">Learn more</a
                                    >.
                                </p>
                            {/if}
                        </div>
                        <div class="u-sep-block-end is-only-mobile u-padding-block-start-16" />
                        <div
                            class="grid-1-2-col-2 u-flex u-flex-vertical u-gap-16 u-min-width-0 mobile-only-inline-20-padding mobile-only-block-start-20-padding">
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
                                    {#if isCloud && limit !== 0 && limit < Infinity}
                                        <Alert>
                                            Logs are retained in rolling {hoursToDays(limit)} intervals
                                            with the {tier} plan.
                                            {#if $organization.billingPlan === BillingPlan.FREE}
                                                <Button link href={$upgradeURL}>Upgrade</Button> to increase
                                                your log retention for a longer period.
                                            {/if}
                                        </Alert>
                                    {/if}
                                    <Code
                                        allowScroll
                                        withCopy
                                        noMargin
                                        code={unescapeNewLines(execution.logs)}
                                        language="sh"
                                        class="limited-code-height" />
                                {:else}
                                    <Card isDashed isTile>
                                        <p class="text u-text-center">No response was recorded.</p>
                                    </Card>
                                {/if}
                            {:else if selectedResponse === 'errors'}
                                {#if execution?.errors}
                                    <Code
                                        allowScroll
                                        withCopy
                                        noMargin
                                        code={unescapeNewLines(execution.errors)}
                                        language="sh"
                                        class="limited-code-height" />
                                {:else}
                                    <Card isDashed isTile>
                                        <p class="text u-text-center">No response was recorded.</p>
                                    </Card>
                                {/if}
                            {:else if selectedResponse === 'headers'}
                                {#if execution.responseHeaders.length}
                                    <TableScroll noMargin>
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
                                    </TableScroll>
                                {/if}
                                <p class="text u-text-center u-padding-16">
                                    {execution.responseHeaders?.length
                                        ? 'Not all header data is'
                                        : 'Header data is not'}
                                    captured by Appwrite for your user's security and privacy. To display
                                    header data in the Logs tab, use
                                    <b>context.log()</b>.
                                    <a
                                        href="https://appwrite.io/docs/products/functions/development#logging"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="link">Learn more</a
                                    >.
                                </p>
                            {:else if selectedResponse === 'body'}
                                <p class="text u-text-center u-padding-16">
                                    Body data is not captured by Appwrite for your user's security
                                    and privacy. To display body data in the Logs tab, use
                                    <b>context.log()</b>.
                                    <a
                                        href="https://appwrite.io/docs/products/functions/development#logging"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="link">Learn more</a
                                    >.
                                </p>
                            {/if}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </section>
{/if}

<style>
    :global(.limited-code-height) {
        overflow: auto;
        max-height: 50vh;
    }

    .code-panel-compact-header .u-flex {
        gap: 1.5rem;
    }

    @media (max-width: 768px) {
        .code-panel-compact-header {
            row-gap: 1rem;
            flex-direction: column;
        }

        .code-panel-content {
            padding: unset;
            padding-block: 1.5rem;
        }

        .mobile-only-inline-20-padding {
            padding-inline: 1.5rem;
        }

        .mobile-only-block-start-20-padding {
            padding-block-start: 1.5rem;
        }

        .code-panel-content.grid-1-2 {
            display: unset;
            row-gap: unset;
        }
    }
</style>
