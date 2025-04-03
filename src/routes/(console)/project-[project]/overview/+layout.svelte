<script lang="ts" context="module">
    export function totalMetrics(set: Array<unknown>): number {
        if (!set) return 0;
        return total((set as Metric[]).map((c) => c.value));
    }
</script>

<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { PlatformsPanel } from '$lib/commandCenter/panels';
    import { Heading, Tab } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { Container, type UsagePeriods } from '$lib/layout';
    import { onMount } from 'svelte';
    import { onboarding, project } from '../store';
    import Bandwidth from './bandwidth.svelte';
    import { createApiKey } from './keys/+page.svelte';
    import Onboard from './onboard.svelte';
    // import Realtime from './realtime.svelte';
    import Requests from './requests.svelte';
    import { usage } from './store';
    import { formatNum } from '$lib/helpers/string';
    import { total } from '$lib/helpers/array';
    import type { Metric } from '$lib/sdk/usage';
    import { periodToDates } from '$lib/layout/usage.svelte';
    import { canWriteProjects } from '$lib/stores/roles';

    let period: UsagePeriods = '30d';
    $: projectId = $page.params.project;
    $: path = `${base}/project-${projectId}/overview`;

    onMount(handle);
    afterNavigate(handle);

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

    $: $registerCommands([
        {
            label: 'Add platform',
            keys: ['a', 'p'],
            callback() {
                addSubPanel(PlatformsPanel);
            },
            icon: 'plus',
            group: 'integrations',
            disabled: !$canWriteProjects
        },
        {
            label: 'Create API Key',
            icon: 'plus',
            callback() {
                createApiKey();
            },
            keys: ['c', 'k'],
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

{#if $project}
    <Container overlapCover>
        {#if $onboarding}
            <Onboard {projectId} />
        {:else}
            {#if $usage}
                {@const storage = humanFileSize($usage.filesStorageTotal ?? 0)}
                <section class="common-section">
                    <div class="grid-dashboard-1s-2m-6l">
                        <div class="card is-2-columns-medium-screen is-3-columns-large-screen">
                            <Bandwidth {period} on:change={(e) => changePeriod(e.detail)} />
                        </div>
                        <div class="card is-2-columns-medium-screen is-3-columns-large-screen">
                            <Requests {period} on:change={(e) => changePeriod(e.detail)} />
                        </div>
                        <a
                            href={`${base}/project-${projectId}/databases`}
                            class="card is-2-columns-large-screen">
                            <div class="grid-item-1">
                                <div class="grid-item-1-start-start">
                                    <div class="eyebrow-heading-3">
                                        <span class="icon-database" aria-hidden="true" />
                                        <span class="text">Database</span>
                                    </div>
                                </div>

                                <div class="grid-item-1-start-end" />

                                <div class="grid-item-1-end-start">
                                    <div class="heading-level-4">
                                        {formatNum($usage.documentsTotal ?? 0)}
                                    </div>
                                    <div>Documents</div>
                                </div>

                                <div class="grid-item-1-end-end">
                                    <div class="text">
                                        Databases: {formatNum($usage.databasesTotal ?? 0)}
                                    </div>
                                </div>
                            </div>
                        </a>
                        <a
                            href={`${base}/project-${projectId}/storage`}
                            class="card is-2-columns-large-screen">
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
                                    <div class="text">
                                        Buckets: {formatNum($usage.bucketsTotal ?? 0)}
                                    </div>
                                </div>
                            </div>
                        </a>
                        <a
                            href={`${base}/project-${projectId}/auth`}
                            class="card is-2-columns-large-screen">
                            <div class="grid-item-1">
                                <div class="grid-item-1-start-start">
                                    <div class="eyebrow-heading-3">
                                        <span class="icon-user-group" aria-hidden="true" />
                                        <span class="text">Auth</span>
                                    </div>
                                </div>

                                <div class="grid-item-1-start-end" />

                                <div class="grid-item-1-end-start">
                                    <div class="heading-level-4">
                                        {formatNum($usage.usersTotal ?? 0)}
                                    </div>
                                    <div>Users</div>
                                </div>
                            </div>
                        </a>
                        <a
                            href={`${base}/project-${projectId}/functions`}
                            class="card is-2-columns-large-screen">
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
                                        {formatNum($usage.executionsTotal ?? 0)}
                                    </div>
                                    <div>Executions</div>
                                </div>

                                <div class="grid-item-1-end-end">
                                    <div class="text" />
                                </div>
                            </div>
                        </a>
                        <!--                        <div-->
                        <!--                            class="card is-2-columns-medium-screen is-2-columns-large-screen is-2-rows-large-screen is-location-row-2-end-large-screen">-->
                        <!--                            <Realtime />-->
                        <!--                        </div>-->
                    </div>
                </section>
            {/if}

            <section class="common-section u-margin-block-start-100">
                <Heading tag="h2" size="5" id="integrations">Integrations</Heading>
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
                    <ul class="tabs-list" role="tablist" data-sveltekit-noscroll>
                        <Tab
                            href={`${path}/platforms`}
                            selected={$page.url.pathname === `${path}/platforms`}
                            event="platforms">Platforms</Tab>
                        <Tab
                            href={`${path}/keys`}
                            selected={$page.url.pathname === `${path}/keys`}
                            event="keys">API keys</Tab>
                    </ul>
                </div>

                <div class="u-margin-block-start-40">
                    <slot />
                </div>
            </section>
        {/if}
    </Container>
{/if}

<style>
    @media (min-width: 1199px) {
        .grid-dashboard-1s-2m-6l {
            grid-template-columns: repeat(12, 1fr);
        }

        .is-3-columns-large-screen {
            /* 6/12 = half */
            grid-column: span 6;
        }

        .is-2-columns-large-screen {
            /* 3/12 = 1/4 → fits 4 items per row */
            grid-column: span 3;
        }
    }
</style>
