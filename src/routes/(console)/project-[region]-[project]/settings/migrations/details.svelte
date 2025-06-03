<script lang="ts">
    import { total } from '$lib/helpers/array';
    import { Modal, Tab } from '$lib/components';
    import Tabs from '$lib/components/tabs.svelte';
    import { formatNum } from '$lib/helpers/string';
    import type { Models } from '@appwrite.io/console';
    import { parseIfString } from '$lib/helpers/object';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { ResourcesFriendly } from '$lib/stores/migration';
    import { IconCheck, IconClock, IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import {
        Alert,
        Card,
        Layout,
        Typography,
        Code,
        Spinner,
        Tag,
        Icon
    } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';

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
    let logs = JSON.stringify(migration, null, 2);
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
        <Code code={logs} lang="json" hideHeader />
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
            <Alert.Inline status="error">
                There was an error migrating some of the project's entities.
                <Button slot="actions" extraCompact on:click={() => (tab = 'logs')}
                    >View logs</Button>
            </Alert.Inline>
        {/if}

        {#if Object.keys(statusCounters).length}
            <Card.Base padding="s" variant="secondary">
                <Layout.Stack gap="l">
                    {#each Object.keys(statusCounters) as entity}
                        {@const entityCounter = statusCounters[entity]}
                        <Layout.Stack
                            direction="row"
                            gap="l"
                            alignItems="center"
                            alignContent="center">
                            <div class="icon-wrapper">
                                {#if hasError(entityCounter)}
                                    <Icon icon={IconExclamation} color="--bgcolor-warning" />
                                {:else if isLoading(entityCounter)}
                                    <Spinner size="s" />
                                {:else if hasSucceeded(entityCounter)}
                                    <Icon icon={IconCheck} />
                                {:else}
                                    <Icon icon={IconClock} />
                                {/if}
                            </div>

                            <div>
                                <span class="u-capitalize"
                                    >{total(Object.values(entityCounter)) > 1
                                        ? ResourcesFriendly[entity].plural
                                        : ResourcesFriendly[entity].singular}</span>

                                <Tag size="xs" selected>{totalItems(entityCounter)}</Tag>
                            </div>
                        </Layout.Stack>
                    {/each}
                </Layout.Stack>
            </Card.Base>
        {/if}
    {/if}
</Modal>

<style lang="scss">
    .icon-wrapper {
        position: relative;

        width: 1.5rem;
        height: 1.5rem;

        > :global(*) {
            top: 50%;
            left: 50%;
            position: absolute;

            transform: translate(-50%, -50%);
        }
    }
</style>
