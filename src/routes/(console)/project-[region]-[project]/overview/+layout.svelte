<script lang="ts" module>
    import { total } from '$lib/helpers/array';
    import { clampMin } from '$lib/helpers/numbers';
    import type { Metric } from '$lib/sdk/usage';

    export function totalMetrics(set: Array<unknown>): number {
        if (!set) return 0;
        return clampMin(total((set as Metric[]).map((c) => c.value)));
    }
</script>

<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { PlatformsPanel } from '$lib/commandCenter/panels';
    import { Tab, Tabs } from '$lib/components';
    import { isTabSelected } from '$lib/helpers/load';
    import { Container, type UsagePeriods } from '$lib/layout';
    import { onMount, setContext, type Component } from 'svelte';
    import Bandwidth from './bandwidth.svelte';
    import Requests from './requests.svelte';
    import { usage } from './store';
    import { periodToDates } from '$lib/layout/usageHelpers';
    import { canWriteProjects } from '$lib/stores/roles';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { writable, type Writable } from 'svelte/store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    let period: UsagePeriods = $state('30d');
    const path = $derived(`${base}/project-${page.params.region}-${page.params.project}/overview`);

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

    const integrationTabs = $derived([
        {
            href: `${path}/platforms`,
            title: 'Platforms',
            event: 'platforms',
            hasChildren: true
        },
        {
            href: `${path}/api-keys`,
            title: 'API keys',
            event: 'api-keys',
            hasChildren: true
        },
        {
            href: `${path}/dev-keys`,
            title: 'Dev keys',
            event: 'dev-keys',
            hasChildren: true
        }
    ]);

    $effect(() => {
        const unregister = $registerCommands([
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
                    goto(`${path}/api-keys/create`);
                },
                keys: ['c', 'k'],
                group: 'integrations',
                disabled: !$canWriteProjects
            }
        ]);
        $updateCommandGroupRanks({
            integrations: 10
        });
        return unregister;
    });
</script>

<svelte:head>
    <title>Console - Appwrite</title>
</svelte:head>

<Container overlapCover>
    <Layout.Stack gap="xxl">
        {#if $usage}
            <Layout.Stack gap="l" direction={$isSmallViewport ? 'column' : 'row'}>
                <Card.Base class="is-2-columns-medium-screen is-3-columns-large-screen" padding="s">
                    <Bandwidth {period} on:change={(e) => changePeriod(e.detail)} />
                </Card.Base>
                <Card.Base class="is-2-columns-medium-screen is-3-columns-large-screen" padding="s">
                    <Requests {period} on:change={(e) => changePeriod(e.detail)} />
                </Card.Base>
            </Layout.Stack>
        {/if}

        <div class="nav-tiles">
            <Card.Link
                padding="s"
                href={`${base}/project-${page.params.region}-${page.params.project}/databases`}>
                <div class="eyebrow-heading-3">
                    <span class="icon-database" aria-hidden="true"></span>
                    <span class="text">Database</span>
                </div>
            </Card.Link>
            <Card.Link
                padding="s"
                href={`${base}/project-${page.params.region}-${page.params.project}/storage`}>
                <div class="eyebrow-heading-3">
                    <span class="icon-folder" aria-hidden="true"></span>
                    <span class="text">Storage</span>
                </div>
            </Card.Link>
            <Card.Link
                padding="s"
                href={`${base}/project-${page.params.region}-${page.params.project}/auth`}>
                <div class="eyebrow-heading-3">
                    <span class="icon-user-group" aria-hidden="true"></span>
                    <span class="text">Auth</span>
                </div>
            </Card.Link>
            <Card.Link
                padding="s"
                href={`${base}/project-${page.params.region}-${page.params.project}/functions`}>
                <div class="eyebrow-heading-3">
                    <span class="icon-lightning-bolt" aria-hidden="true"></span>
                    <span class="text">Functions</span>
                </div>
            </Card.Link>
        </div>

        <Layout.Stack gap="xl">
            <Typography.Title>Integrations</Typography.Title>
            <Layout.Stack gap="xl" direction="row" justifyContent="space-between">
                <Tabs>
                    {#each integrationTabs as tab}
                        <Tab
                            noscroll
                            href={tab.href}
                            event={tab.event}
                            selected={isTabSelected(tab, page.url.pathname, path, integrationTabs)}
                            >{tab.title}</Tab>
                    {/each}
                </Tabs>
                {#if $action}
                    <svelte:component this={$action} />
                {/if}
            </Layout.Stack>
            <slot />
        </Layout.Stack>
    </Layout.Stack>
</Container>

<style>
    .nav-tiles {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    @media (min-width: 768px) {
        .nav-tiles {
            grid-template-columns: repeat(4, 1fr);
        }
    }
</style>
