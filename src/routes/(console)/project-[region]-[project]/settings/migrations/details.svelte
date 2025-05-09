<script lang="ts">
    import { Alert, Modal, Tab } from '$lib/components';
    import Tabs from '$lib/components/tabs.svelte';
    import { total } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { parseIfString } from '$lib/helpers/object';
    import { formatNum } from '$lib/helpers/string';
    import type { Models } from '@appwrite.io/console';
    import { ResourcesFriendly } from '$lib/stores/migration';
    import { Card, Layout, Typography, Code } from '@appwrite.io/pink-svelte';

    export let migration: Models.Migration = null;
    export let show = false;

    type StatusCounters = {
        [resource in 'Database' | 'Collection' | 'Function' | 'Users']?: StatusCounter;
    };
    type StatusCounter = {
        [statusType in 'pending' | 'success' | 'error' | 'skip' | 'processing' | 'warning']: number;
    };

    $: statusCounters = parseIfString(
        (migration?.statusCounters as unknown as string) || '{}'
    ) as StatusCounters;

    const hasError = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.error > 0 || counter.warning > 0;
    };

    const isLoading = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.pending > 0 || counter.processing > 0;
    };

    const hasSucceeded = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.success > 0;
    };

    const totalItems = (counter: StatusCounter) => {
        if (!counter) return 0;
        return formatNum(total(Object.values(counter)));
    };

    let tab = 'details' as 'details' | 'logs';
</script>

<Modal
    bind:show
    title={migration.status === 'failed' ? 'Resolve migration issues' : 'Migration details'}
    hideFooter>
    <Tabs stretch let:root>
        <Tab {root} selected={tab === 'details'} on:click={() => (tab = 'details')}>Details</Tab>
        <Tab {root} selected={tab === 'logs'} on:click={() => (tab = 'logs')}>Logs</Tab>
    </Tabs>

    {#if tab === 'logs'}
        <Code code={JSON.stringify(migration, null, 2)} lang="json" hideHeader />
    {:else if tab === 'details'}
        <Card.Base variant="secondary" padding="s">
            <Layout.Stack>
                <Layout.Stack direction="row">
                    <span style:flex-basis="50%">
                        <Typography.Text variant="m-600">Date</Typography.Text>
                    </span>
                    <span>{toLocaleDateTime(migration.$createdAt)}</span>
                </Layout.Stack>
                <Layout.Stack direction="row">
                    <span style:flex-basis="50%">
                        <Typography.Text variant="m-600">Source</Typography.Text>
                    </span>
                    <span>{migration.source}</span>
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>

        {#if Object.values(statusCounters).some(hasError)}
            <Alert
                type="error"
                buttons={[
                    {
                        slot: 'View logs',
                        onClick() {
                            tab = 'logs';
                        }
                    }
                ]}>
                There was an error migrating some of the project's entities.
            </Alert>
        {/if}

        {#if Object.keys(statusCounters).length}
            <div class="box">
                {#each Object.keys(statusCounters) as entity}
                    {@const entityCounter = statusCounters[entity]}
                    <div class="u-flex u-cross-center u-gap-16">
                        <div class="icon-wrapper">
                            {#if hasError(entityCounter)}
                                <i class="icon-exclamation"></i>
                            {:else if isLoading(entityCounter)}
                                <div class="u-flex">
                                    <span class="loader"></span>
                                </div>
                            {:else if hasSucceeded(entityCounter)}
                                <i class="icon-check"></i>
                            {:else}
                                <i class="icon-clock"></i>
                            {/if}
                        </div>

                        <div>
                            <span class="u-capitalize"
                                >{total(Object.values(entityCounter)) > 1
                                    ? ResourcesFriendly[entity].plural
                                    : ResourcesFriendly[entity].singular}</span>
                            <span class="inline-tag">{totalItems(entityCounter)}</span>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</Modal>

<style lang="scss">
    .box {
        padding: 0;

        > div {
            padding: 1.25rem;

            &:not(:last-child) {
                border-bottom: 1px solid hsl(var(--border));
            }
        }
    }

    .icon-wrapper {
        position: relative;

        width: 1.5rem;
        height: 1.5rem;

        > * {
            position: absolute;
            top: 50%;
            left: 50%;

            transform: translate(-50%, -50%);
        }
    }

    .icon-exclamation {
        color: hsl(var(--color-danger-100));
    }
</style>
