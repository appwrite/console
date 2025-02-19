<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import type { Models } from '@appwrite.io/console';
    import { IconChevronDown, IconChevronUp } from '@appwrite.io/pink-icons-svelte';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import {
        Accordion,
        Badge,
        Icon,
        Layout,
        Sheet,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import LogsRequest from './(components)/LogsRequest.svelte';
    import LogsResponse from './(components)/LogsResponse.svelte';

    export let open = false;
    export let selectedLogId: string;
    export let logs: Models.Execution[];

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
    $: console.log(selectedLog);
</script>

<Sheet bind:open>
    <div slot="header" style:width="100%">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Layout.Stack direction="row" gap="m" alignItems="center">
                <Typography.Text variant="m-400">Log ID</Typography.Text>
                <Tag size="s">{selectedLog?.$id}</Tag>
            </Layout.Stack>
            <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                <Button icon text size="s" on:click={previousLog} disabled={isFirstLog}>
                    <Icon icon={IconChevronUp}></Icon>
                </Button>
                <Button icon text size="s" on:click={nextLog} disabled={isLastLog}>
                    <Icon icon={IconChevronDown}></Icon>
                </Button>
            </Layout.Stack>
        </Layout.Stack>
    </div>
    {#if selectedLog}
        <Layout.Stack gap="xl">
            <Accordion title="Details" open>
                <Layout.Stack gap="xl">
                    <Layout.Stack direction="row" gap="xxl">
                        <Layout.Stack gap="xs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">
                                Method
                            </Typography.Text>
                            <Typography.Text variant="m-400">
                                {selectedLog.requestMethod}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">
                                Status code
                            </Typography.Text>
                            <span>
                                <Badge
                                    content={selectedLog.responseStatusCode.toString()}
                                    variant="secondary"
                                    type={selectedLog?.responseStatusCode >= 400
                                        ? 'error'
                                        : 'success'} />
                            </span>
                        </Layout.Stack>
                        <Layout.Stack gap="xs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">
                                Duration
                            </Typography.Text>
                            <Typography.Text variant="m-400">
                                {calculateTime(selectedLog.duration)}
                            </Typography.Text>
                        </Layout.Stack>
                        <Layout.Stack gap="xs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">
                                Created
                            </Typography.Text>
                            <Typography.Text variant="m-400">
                                {timeFromNow(selectedLog.$createdAt)}
                            </Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                    <Layout.Stack gap="xs" inline>
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                            Path
                        </Typography.Text>
                        <Typography.Text variant="m-400">
                            {selectedLog.requestPath}
                        </Typography.Text>
                    </Layout.Stack>
                </Layout.Stack>
            </Accordion>
            <Accordion title="Request" open>
                <LogsRequest {selectedLog} />
            </Accordion>
            <Accordion title="Response" open>
                <LogsResponse {selectedLog} />
            </Accordion>
        </Layout.Stack>
    {/if}
</Sheet>
