<script lang="ts">
    import { untrack } from 'svelte';
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Realtime } from '@appwrite.io/console';
    import { Badge, Empty, Icon, Layout, Table, Typography } from '@appwrite.io/pink-svelte';
    import { IconPause, IconPlay, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import { toLocaleTimeISO } from '$lib/helpers/date';
    import {
        actionOptions,
        frameScopeId,
        MAX_EVENTS,
        typeOptions,
        type TailFrame,
        type TailStats
    } from './store';

    type Subscription = Awaited<ReturnType<Realtime['subscribe']>>;

    let events = $state<TailFrame[]>([]);
    let paused = $state(false);
    let delivered = $state(0);
    let dropped = $state(0);
    let typeFilter = $state('');
    let actionFilter = $state('');
    let subscription = $state<Subscription | null>(null);

    const projectId = $derived(page.params.project);
    const region = $derived(page.params.region);

    function buildQueries(): string[] {
        const queries: string[] = [];
        if (typeFilter) queries.push(Query.equal('type', [typeFilter]));
        if (actionFilter) queries.push(Query.equal('action', [actionFilter]));
        return queries;
    }

    const columns = [
        { id: 'timestamp', title: 'Time', width: { min: 100, max: 120 } },
        { id: 'type', title: 'Type', width: { min: 90, max: 130 } },
        { id: 'action', title: 'Action', width: { min: 90, max: 110 } },
        { id: 'event', title: 'Event', width: { min: 220, max: 420 } },
        { id: 'resource', title: 'Resource', width: { min: 120, max: 180 } },
        { id: 'userId', title: 'User', width: { min: 120, max: 200 } }
    ];

    const actionStatus: Record<string, 'success' | 'warning' | 'error'> = {
        create: 'success',
        update: 'warning',
        delete: 'error'
    };

    function onMessage(response: { events: string[]; payload: unknown }) {
        if (response.events.includes('console.tail.stats')) {
            const stats = response.payload as TailStats;
            delivered = stats.delivered ?? delivered;
            dropped = stats.dropped ?? dropped;
            return;
        }

        if (response.events.includes('console.tail')) {
            if (paused) return;
            const frames = (response.payload as TailFrame[]) ?? [];
            if (!frames.length) return;
            // Newest frame on top: reverse the batch (chronological) before prepending.
            events = [...frames].reverse().concat(events).slice(0, MAX_EVENTS);
        }
    }

    // Open exactly one realtime connection for the page. The Appwrite Realtime client
    // multiplexes everything over a single socket, so we subscribe once per project and
    // never tear the socket down on filter changes. Re-runs only when the project/region
    // identity changes (filters are read untracked so they don't trigger a reconnect).
    $effect(() => {
        const channel = `console.tail.${projectId}`;
        const realtime = sdk.forConsoleIn(region).realtime;

        let cancelled = false;
        let localSub: Subscription | null = null;

        realtime.subscribe(channel, onMessage, untrack(buildQueries)).then((sub) => {
            if (cancelled) {
                sub.close();
                return;
            }
            localSub = sub;
            subscription = sub;
        });

        return () => {
            cancelled = true;
            localSub?.close();
            if (subscription === localSub) subscription = null;
        };
    });

    // Apply server-side filter changes in place via update() — no reconnect. Runs when a
    // filter changes or when the subscription is first established.
    $effect(() => {
        const queries = buildQueries();
        subscription?.update({ queries });
    });

    function clear() {
        events = [];
        dropped = 0;
        delivered = 0;
    }
</script>

<Container>
    <Layout.Stack direction="row" alignItems="flex-end" justifyContent="space-between" wrap="wrap">
        <Layout.Stack direction="row" gap="s" alignItems="flex-end" inline>
            <InputSelect id="type" label="Type" options={typeOptions} bind:value={typeFilter} />
            <InputSelect
                id="action"
                label="Action"
                options={actionOptions}
                bind:value={actionFilter} />
        </Layout.Stack>

        <Layout.Stack direction="row" gap="s" inline>
            <Button secondary on:click={() => (paused = !paused)}>
                <Icon icon={paused ? IconPlay : IconPause} slot="start" size="s" />
                {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button secondary disabled={!events.length} on:click={clear}>
                <Icon icon={IconTrash} slot="start" size="s" />
                Clear
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if dropped > 0}
        <Layout.Stack direction="row" gap="s" alignItems="center">
            <Badge variant="secondary" type="warning" content={`${dropped} dropped`} size="xs" />
            <Typography.Text color="--fgcolor-neutral-secondary">
                Sampling dropped events under load ({delivered} delivered).
            </Typography.Text>
        </Layout.Stack>
    {/if}

    {#if events.length}
        <Table.Root {columns} let:root>
            <svelte:fragment slot="header" let:root>
                {#each columns as { id, title }}
                    <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
                {/each}
            </svelte:fragment>
            {#each events as frame, index (index)}
                <Table.Row.Base {root}>
                    <Table.Cell column="timestamp" {root}>
                        {toLocaleTimeISO(frame.timestamp)}
                    </Table.Cell>
                    <Table.Cell column="type" {root}>{frame.type}</Table.Cell>
                    <Table.Cell column="action" {root}>
                        <Badge
                            variant="secondary"
                            type={actionStatus[frame.action] ?? undefined}
                            content={frame.action}
                            size="xs" />
                    </Table.Cell>
                    <Table.Cell column="event" {root}>
                        <Typography.Code
                            style="display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                            {frame.event}
                        </Typography.Code>
                    </Table.Cell>
                    <Table.Cell column="resource" {root}>
                        <Typography.Text truncate>{frameScopeId(frame) || '-'}</Typography.Text>
                    </Table.Cell>
                    <Table.Cell column="userId" {root}>
                        <Typography.Text truncate>{frame.userId || '-'}</Typography.Text>
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    {:else}
        <Empty
            title={paused ? 'Paused' : 'Waiting for events…'}
            description={paused
                ? 'Resume to keep streaming live project events.'
                : 'Live project events will appear here as they happen.'} />
    {/if}
</Container>
