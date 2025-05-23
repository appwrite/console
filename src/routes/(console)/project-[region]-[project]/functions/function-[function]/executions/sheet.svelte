<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import type { Models } from '@appwrite.io/console';
    import { IconChevronDown, IconChevronUp } from '@appwrite.io/pink-icons-svelte';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import {
        Accordion,
        Badge,
        InteractiveText,
        Icon,
        Layout,
        Sheet,
        Tag,
        Typography,
        Tooltip,
        Status
    } from '@appwrite.io/pink-svelte';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { capitalize } from '$lib/helpers/string';
    import { Copy } from '$lib/components';
    import { logStatusConverter } from './store';
    import { LogsRequest, LogsResponse } from '$lib/components/logs';

    export let selectedLogId: string;
    export let logs: Models.Execution[];
    export let logging: boolean;
    export let open = false;

    function nextLog() {
        const currentIndex = logs.findIndex((log) => log.$id === selectedLogId);
        if (currentIndex < logs.length - 1) {
            selectedLogId = logs[currentIndex + 1].$id;
        }
    }
    function previousLog() {
        const currentIndex = logs.findIndex((log) => log.$id === selectedLogId);
        if (currentIndex > 0) {
            selectedLogId = logs[currentIndex - 1].$id;
        }
    }

    $: if (!open) {
        selectedLogId = null;
    }

    $: selectedLog = logs?.find((log) => log.$id === selectedLogId);
    $: isFirstLog = logs.findIndex((log) => log.$id === selectedLogId) === 0;
    $: isLastLog = logs.findIndex((log) => log.$id === selectedLogId) === logs.length - 1;

    let sheet: HTMLDivElement;
    function handleClickOutside(event: MouseEvent) {
        if (sheet && !sheet.contains(event.target as Node)) {
            open = false;
        }
    }
</script>

<svelte:window onclick={handleClickOutside} />

<div style="position: absolute; top: 0; " bind:this={sheet}>
    <Sheet bind:open closeOnBlur={false}>
        <div slot="header" style:width="100%">
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Layout.Stack direction="row" gap="m" alignItems="center">
                    <Typography.Text variant="m-400">Execution ID</Typography.Text>
                    <Copy value={selectedLog?.$id}>
                        <Tag size="s" variant="code">{selectedLog?.$id}</Tag>
                    </Copy>
                </Layout.Stack>
                <Layout.Stack direction="row" gap="xs" alignItems="center" inline>
                    <Button icon text size="xs" on:click={previousLog} disabled={isFirstLog}>
                        <Icon icon={IconChevronUp} />
                    </Button>
                    <Button icon text size="xs" on:click={nextLog} disabled={isLastLog}>
                        <Icon icon={IconChevronDown} />
                    </Button>
                </Layout.Stack>
            </Layout.Stack>
        </div>
        {#if selectedLog}
            <Layout.Stack gap="xl">
                <Accordion title="Details" open>
                    <Layout.Stack gap="xxxl">
                        <Layout.Stack gap="xxxl" direction="row" wrap="wrap">
                            <Layout.Stack gap="xs" inline>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Method
                                </Typography.Text>
                                <Typography.Text variant="m-400">
                                    {selectedLog.requestMethod}
                                </Typography.Text>
                            </Layout.Stack>
                            <Layout.Stack gap="xs" inline>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Status code
                                </Typography.Text>
                                <span>
                                    <Badge
                                        content={selectedLog.responseStatusCode.toString()}
                                        variant="secondary"
                                        type={selectedLog?.responseStatusCode >= 400
                                            ? 'error'
                                            : selectedLog.responseStatusCode === 0
                                              ? undefined
                                              : 'success'} />
                                </span>
                            </Layout.Stack>
                            <Layout.Stack gap="xs" inline>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Status
                                </Typography.Text>

                                <Tooltip
                                    disabled={!selectedLog?.scheduledAt ||
                                        selectedLog.status !== 'scheduled'}
                                    maxWidth="400px">
                                    <div>
                                        <Status
                                            status={logStatusConverter(selectedLog.status)}
                                            label={capitalize(selectedLog.status)}>
                                        </Status>
                                    </div>
                                    <span slot="tooltip">
                                        {`Scheduled to execute on ${toLocaleDateTime(selectedLog.scheduledAt)}`}
                                    </span>
                                </Tooltip>
                            </Layout.Stack>

                            <Layout.Stack gap="xs" inline>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Triggered by
                                </Typography.Text>
                                <Typography.Text variant="m-400">
                                    {capitalize(selectedLog.trigger)}
                                </Typography.Text>
                            </Layout.Stack>

                            <Layout.Stack gap="xs" inline>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Duration
                                </Typography.Text>
                                <Typography.Text variant="m-400">
                                    {calculateTime(selectedLog.duration)}
                                </Typography.Text>
                            </Layout.Stack>

                            <Layout.Stack gap="xs" inline>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Created
                                </Typography.Text>
                                <Typography.Text variant="m-400">
                                    {capitalize(timeFromNow(selectedLog.$createdAt))}
                                </Typography.Text>
                            </Layout.Stack>
                        </Layout.Stack>
                        <Layout.Stack gap="xs" inline alignItems="flex-start">
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                Path
                            </Typography.Text>
                            <div>
                                <InteractiveText
                                    text={selectedLog.requestPath}
                                    variant="copy-code"
                                    isVisible />
                            </div>
                        </Layout.Stack>
                    </Layout.Stack>
                </Accordion>
                <Accordion title="Request" open>
                    <LogsRequest {selectedLog} product="function" />
                </Accordion>
                <Accordion title="Response" open hideDivider>
                    <LogsResponse {selectedLog} product="function" {logging} />
                </Accordion>
            </Layout.Stack>
        {/if}
    </Sheet>
</div>
