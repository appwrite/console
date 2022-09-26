<script lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import { Container } from '$lib/layout';
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../store';
    import { usage, type UsagePeriods } from './store';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { DropList, DropListItem } from '$lib/components';
    import { BarChart, LineChart } from '$lib/charts';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';

    $: projectId = $page.params.project;
    $: path = `/console/project-${projectId}/overview`;

    let period: UsagePeriods = '30d';
    let showPeriodBandwith = false;
    let showPeriodRequests = false;

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        if ($usage) {
            await usage.load(projectId, period);
        } else {
            usage.load(projectId, period);
        }

        title.set($project.name);
        tabs.set([]);
        backButton.set('');

        copyData.set({
            text: 'Project ID',
            value: $project.$id
        });
    }

    const formatter = Intl.NumberFormat('en', {
        notation: 'compact'
    });

    // TODO: metric type is wrong
    function last(set: Array<unknown>): Models.Metric | null {
        return (set as Models.Metric[]).slice(-1)[0] ?? null;
    }

    // TODO: metric type is wrong
    function total(set: Array<unknown>): number {
        return (set as Models.Metric[]).reduce((prev, curr) => prev + curr.value, 0);
    }

    function format(number: number): string {
        return formatter.format(number);
    }

    function changePeriod(newPeriod: UsagePeriods) {
        period = newPeriod;
        usage.load(projectId, period);
        showPeriodBandwith = false;
        showPeriodRequests = false;
    }

    if (browser) {
        sdkForConsole.client.subscribe<unknown>('console', (message) => {
            if (message.events.includes('stats.connections')) {
                // TODO: take care of realtime connections
                return;
            }
        });
    }
</script>

<svelte:head>
    <title>Appwrite - Console</title>
</svelte:head>

{#if $project}
    <Container overlapCover>
        {#if $usage}
            {@const bandwith = humanFileSize(total($usage.network))}
            {@const storage = humanFileSize(last($usage.storage).value)}
            <section class="common-section">
                <div class="grid-dashboard-1s-2m-6l">
                    <div class="card is-2-columns-medium-screen is-3-columns-large-screen">
                        <div class="u-flex u-gap-16 u-main-space-between">
                            <div>
                                <div class="heading-level-4">
                                    {bandwith.value}
                                    <span class="body-text-2">{bandwith.unit}</span>
                                </div>
                                <div>Bandwidth</div>
                            </div>
                            <DropList
                                bind:show={showPeriodBandwith}
                                position="bottom"
                                horizontal="left"
                                arrowPosition="end"
                                childStart>
                                <button
                                    class="transparent-button"
                                    on:click={() => (showPeriodBandwith = !showPeriodBandwith)}>
                                    <span class="text">{period}</span>
                                    <span class="icon-cheveron-down" aria-hidden="true" />
                                </button>
                                <svelte:fragment slot="list">
                                    <DropListItem on:click={() => changePeriod('24h')}>
                                        24h
                                    </DropListItem>
                                    <DropListItem on:click={() => changePeriod('30d')}>
                                        30d
                                    </DropListItem>
                                    <DropListItem on:click={() => changePeriod('90d')}>
                                        90d
                                    </DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </div>
                        <BarChart
                            series={[
                                {
                                    name: 'Bandwith',
                                    data: [...$usage.network.map((e) => [e.date * 1000, e.value])]
                                }
                            ]} />
                    </div>
                    <div class="card is-2-columns-medium-screen is-3-columns-large-screen">
                        <div class="u-flex u-gap-16 u-main-space-between">
                            <div>
                                <div class="heading-level-4">
                                    {format(total($usage.requests))}
                                </div>
                                <div>Requests</div>
                            </div>
                            <DropList
                                bind:show={showPeriodRequests}
                                position="bottom"
                                horizontal="left"
                                arrowPosition="end"
                                childStart>
                                <button
                                    class="transparent-button"
                                    on:click={() => (showPeriodRequests = !showPeriodRequests)}>
                                    <span class="text">{period}</span>
                                    <span class="icon-cheveron-down" aria-hidden="true" />
                                </button>
                                <svelte:fragment slot="list">
                                    <DropListItem on:click={() => changePeriod('24h')}>
                                        24h
                                    </DropListItem>
                                    <DropListItem on:click={() => changePeriod('30d')}>
                                        30d
                                    </DropListItem>
                                    <DropListItem on:click={() => changePeriod('90d')}>
                                        90d
                                    </DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </div>
                        <LineChart
                            series={[
                                {
                                    name: 'Requests',
                                    data: [...$usage.requests.map((e) => [e.date * 1000, e.value])]
                                }
                            ]} />
                    </div>
                    <div class="card is-2-columns-large-screen">
                        <div class="grid-item-1">
                            <div class="grid-item-1-start-start">
                                <div class="eyebrow-heading-3">
                                    <span class="icon-database" aria-hidden="true" />
                                    <span class="text">Database</span>
                                </div>
                            </div>

                            <div class="grid-item-1-start-end" />

                            <div class="grid-item-1-end-start">
                                <div class="heading-level-4">XX</div>
                                <div>Databases</div>
                            </div>

                            <div class="grid-item-1-end-end">
                                <div class="text">Documents: {last($usage.documents).value}</div>
                            </div>
                        </div>
                    </div>
                    <div class="card is-2-columns-large-screen">
                        <div class="grid-item-1">
                            <div class="grid-item-1-start-start">
                                <div class="eyebrow-heading-3">
                                    <span class="icon-folder" aria-hidden="true" />
                                    <span class="text">Storage</span>
                                </div>
                            </div>

                            <div class="grid-item-1-start-end" />

                            <div class="grid-item-1-end-start">
                                <div class="heading-level-4">
                                    {storage.value}
                                    <span class="body-text-2">{storage.unit}</span>
                                </div>
                                <div>Storage</div>
                            </div>

                            <div class="grid-item-1-end-end">
                                <div class="text">Buckets: XX</div>
                            </div>
                        </div>
                    </div>
                    <div class="card is-2-columns-large-screen">
                        <div class="grid-item-1">
                            <div class="grid-item-1-start-start">
                                <div class="eyebrow-heading-3">
                                    <span class="icon-user-group" aria-hidden="true" />
                                    <span class="text">authentication</span>
                                </div>
                            </div>

                            <div class="grid-item-1-start-end" />

                            <div class="grid-item-1-end-start">
                                <div class="heading-level-4">
                                    {format(last($usage.users).value)}
                                </div>
                                <div>Users</div>
                            </div>

                            <div class="grid-item-1-end-end">
                                <div class="text">Sessions: XX</div>
                            </div>
                        </div>
                    </div>
                    <div class="card is-2-columns-large-screen">
                        <div class="grid-item-1">
                            <div class="grid-item-1-start-start">
                                <div class="eyebrow-heading-3">
                                    <span class="icon-lightning-bolt" aria-hidden="true" />
                                    <span class="text">Functions</span>
                                </div>
                            </div>

                            <div class="grid-item-1-start-end" />

                            <div class="grid-item-1-end-start">
                                <div class="heading-level-4">
                                    {format(last($usage.functions).value)}
                                </div>
                                <div>Executions</div>
                            </div>

                            <div class="grid-item-1-end-end">
                                <div class="text" />
                            </div>
                        </div>
                    </div>
                    <div
                        class="card is-2-columns-medium-screen is-2-columns-large-screen is-2-rows-large-screen is-location-row-2-end-large-screen">
                        <div class="heading-level-4">10</div>
                        <div>Realtime Connections</div>
                    </div>
                </div>
            </section>
        {/if}

        <section class="common-section u-margin-block-start-100">
            <h2 class="heading-level-5">Integrations</h2>
            <div class="tabs u-margin-block-start-24 u-sep-block-end">
                <button
                    class="tabs-button-scroll is-start u-hide"
                    aria-label="Show items in start side">
                    <span class="icon-cheveron-left" aria-hidden="true" />
                </button>
                <button
                    class="tabs-button-scroll is-end u-hide"
                    aria-label="Show items in end side">
                    <span class="icon-cheveron-right" aria-hidden="true" />
                </button>
                <ul class="tabs-list" data-sveltekit-noscroll>
                    <li class="tabs-item">
                        <a
                            class="tabs-button"
                            href={`${path}/platforms`}
                            class:is-selected={$page.url.pathname === `${path}/platforms`}>
                            <span class="text">Platforms</span>
                        </a>
                    </li>
                    <li class="tabs-item">
                        <a
                            class="tabs-button"
                            href={`${path}/keys`}
                            class:is-selected={$page.url.pathname === `${path}/keys`}>
                            <span class="text">API Keys</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div class="u-margin-block-start-40">
                <slot />
            </div>
        </section>
    </Container>
{/if}

<style>
    .grid-item-1 {
        min-block-size: 6.5rem; /* TODO: remove */
    }
</style>
