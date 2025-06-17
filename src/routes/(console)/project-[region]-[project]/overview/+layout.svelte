<script lang="ts" context="module">
    import { total } from '$lib/helpers/array';
    import type { Metric } from '$lib/sdk/usage';

    export function totalMetrics(set: Array<unknown>): number {
        if (!set) return 0;
        return total((set as Metric[]).map((c) => c.value));
    }
</script>

<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import { page } from '$app/state';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { PlatformsPanel } from '$lib/commandCenter/panels';
    import { Tab, Tabs } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { Container, type UsagePeriods } from '$lib/layout';
    import { onMount, setContext, type Component } from 'svelte';
    import Bandwidth from './bandwidth.svelte';
    import Requests from './requests.svelte';
    import { usage } from './store';
    import { formatNum } from '$lib/helpers/string';
    import { periodToDates } from '$lib/layout/usage.svelte';
    import { canWriteProjects } from '$lib/stores/roles';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { writable, type Writable } from 'svelte/store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { getProjectRoute } from '$lib/helpers/project';

    let period: UsagePeriods = '30d';
    $: path = getProjectRoute('/overview');

    onMount(handle);
    afterNavigate(handle);

    const action = setContext<Writable<Component>>('overview-action', writable(null));

    async function handle() {
        const promise = changePeriod(period);

        if ($usage) {
            await promise;
        }
    }

    function changePeriod(newPeriod: UsagePeriods) {
        period = newPeriod;
        const dates = periodToDates(newPeriod);
        return usage.load(dates.start, dates.end, dates.period);
    }

    function isTabSelected(key: string) {
        return page.url.pathname === `${path}/${key}`;
    }

    $: $registerCommands([
        {
            label: 'Add platform',
            keys: ['a', 'p'],
            callback() {
                addSubPanel(PlatformsPanel);
            },
            icon: IconPlus,
            group: 'integrations',
            disabled: !$canWriteProjects
        },
        {
            label: 'Create API Key',
            icon: IconPlus,
            callback() {
                goto(`${path}/keys/create`);
            },
            keys: ['c', 'k'],
            group: 'integrations',
            disabled: !$canWriteProjects
        },
        {
            label: 'Create Dev Key',
            icon: IconPlus,
            callback() {
                goto(`${path}/dev-keys/create`);
            },
            keys: ['c', 'd', 'k'],
            group: 'integrations',
            disabled: !$canWriteProjects
        }
    ]);

    $: $updateCommandGroupRanks({
        integrations: 10
    });
</script>

<svelte:head>
    <title>Console - Appwrite</title>
</svelte:head>

<Container overlapCover>
    <Layout.Stack gap="xxl">
        {#if $usage}
            {@const storage = humanFileSize($usage.filesStorageTotal ?? 0)}
            <Layout.Stack gap="xl">
                <Layout.Stack gap="l" direction={$isSmallViewport ? 'column' : 'row'}>
                    <Card.Base
                        class="is-2-columns-medium-screen is-3-columns-large-screen"
                        padding="s">
                        <Bandwidth {period} on:change={(e) => changePeriod(e.detail)} />
                    </Card.Base>
                    <Card.Base
                        class="is-2-columns-medium-screen is-3-columns-large-screen"
                        padding="s">
                        <Requests {period} on:change={(e) => changePeriod(e.detail)} />
                    </Card.Base>
                </Layout.Stack>

                <Layout.Stack gap="xl" direction={$isSmallViewport ? 'column' : 'row'}>
                    <Card.Link
                        padding="s"
                        href={getProjectRoute('/databases')}
                        class="is-2-columns-large-screen">
                        <div class="grid-item-1">
                            <div class="grid-item-1-start-start">
                                <div class="eyebrow-heading-3">
                                    <span class="icon-database" aria-hidden="true"></span>
                                    <span class="text">Database</span>
                                </div>
                            </div>

                            <div class="grid-item-1-start-end"></div>

                            <div class="grid-item-1-end-start">
                                <Typography.Title>
                                    {formatNum($usage.documentsTotal ?? 0)}
                                </Typography.Title>
                                <Typography.Text>Documents</Typography.Text>
                            </div>
                        </div>
                    </Card.Link>
                    <Card.Link
                        padding="s"
                        href={getProjectRoute('/storage')}
                        class="is-2-columns-large-screen">
                        <div class="grid-item-1">
                            <div class="grid-item-1-start-start">
                                <div class="eyebrow-heading-3">
                                    <span class="icon-folder" aria-hidden="true"></span>
                                    <span class="text">Storage</span>
                                </div>
                            </div>

                            <div class="grid-item-1-start-end"></div>

                            <div class="grid-item-1-end-start">
                                <Typography.Title>
                                    {storage.value}
                                    <span class="body-text-2">{storage.unit}</span>
                                </Typography.Title>
                                <Typography.Text>Storage</Typography.Text>
                            </div>
                        </div>
                    </Card.Link>
                    <Card.Link
                        padding="s"
                        href={getProjectRoute('/auth')}
                        class="is-2-columns-large-screen">
                        <div class="grid-item-1">
                            <div class="grid-item-1-start-start">
                                <div class="eyebrow-heading-3">
                                    <span class="icon-user-group" aria-hidden="true"></span>
                                    <span class="text">Auth</span>
                                </div>
                            </div>

                            <div class="grid-item-1-start-end"></div>

                            <div class="grid-item-1-end-start">
                                <Typography.Title>
                                    {formatNum($usage.usersTotal ?? 0)}
                                </Typography.Title>
                                <Typography.Text>Users</Typography.Text>
                            </div>
                        </div>
                    </Card.Link>
                    <Card.Link
                        padding="s"
                        href={getProjectRoute('/functions')}
                        class="is-2-columns-large-screen">
                        <div class="grid-item-1">
                            <div class="grid-item-1-start-start">
                                <div class="eyebrow-heading-3">
                                    <span class="icon-lightning-bolt" aria-hidden="true"></span>
                                    <span class="text">Functions</span>
                                </div>
                            </div>

                            <div class="grid-item-1-start-end"></div>

                            <div class="grid-item-1-end-start">
                                <Typography.Title>
                                    {formatNum($usage.executionsTotal ?? 0)}
                                </Typography.Title>
                                <Typography.Text>Executions</Typography.Text>
                            </div>

                            <div class="grid-item-1-end-end">
                                <div class="text"></div>
                            </div>
                        </div>
                    </Card.Link>
                    <!--                    <Card.Base-->
                    <!--                        padding="s"-->
                    <!--                        class="is-2-columns-medium-screen is-2-columns-large-screen is-2-rows-large-screen is-location-row-2-end-large-screen">-->
                    <!--                        <Realtime />-->
                    <!--                    </Card.Base>-->
                </Layout.Stack>
            </Layout.Stack>
        {/if}

        <Layout.Stack gap="xl">
            <Typography.Title>Integrations</Typography.Title>
            <Layout.Stack gap="xl" direction="row" justifyContent="space-between">
                <Tabs>
                    <Tab
                        noscroll
                        event="platforms"
                        href={`${path}/platforms`}
                        selected={isTabSelected('platforms')}>Platforms</Tab>
                    <Tab
                        noscroll
                        event="keys"
                        href={`${path}/keys`}
                        selected={isTabSelected('keys')}>API keys</Tab>
                    <Tab
                        noscroll
                        event="keys"
                        href={`${path}/dev-keys`}
                        selected={isTabSelected('dev-keys')}>Dev keys</Tab>
                </Tabs>
                {#if $action}
                    <svelte:component this={$action} />
                {/if}
            </Layout.Stack>
            <slot />
        </Layout.Stack>
    </Layout.Stack>
</Container>
