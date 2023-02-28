<script context="module" lang="ts">
    const formatter = Intl.NumberFormat('en', {
        notation: 'compact'
    });

    // TODO: metric type is wrong
    export function last(set: Array<unknown>): Models.Metric | null {
        if (!set) return null;
        return (set as Models.Metric[]).slice(-1)[0] ?? null;
    }

    // TODO: metric type is wrong
    export function total(set: Array<unknown>): number {
        if (!set) return 0;
        return (set as Models.Metric[]).reduce((prev, curr) => prev + curr.value, 0);
    }

    export function format(number: number): string {
        return formatter.format(number);
    }
</script>

<script lang="ts">
    import type { Models } from '@aw-labs/appwrite-console';
    import { Container, type UsagePeriods } from '$lib/layout';
    import { page } from '$app/stores';
    import { onboarding, project } from '../store';
    import { usage } from './store';
    import { onMount } from 'svelte';
    import { afterNavigate } from '$app/navigation';
    import { Heading } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { base } from '$app/paths';
    import Realtime from './realtime.svelte';
    import Bandwith from './bandwith.svelte';
    import Requests from './requests.svelte';
    import Onboard from './onboard.svelte';

    $: projectId = $page.params.project;
    $: path = `/console/project-${projectId}/overview`;
    let period: UsagePeriods = '30d';

    onMount(handle);
    afterNavigate(handle);

    async function handle() {
        const promise = usage.load(period);

        if ($usage) {
            await promise;
        }
    }

    function changePeriod(newPeriod: UsagePeriods) {
        period = newPeriod;
        usage.load(period);
    }
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
                {@const storage = humanFileSize(total($usage.filesStorage))}

                <section class="common-section">
                    <div class="grid-dashboard-1s-2m-6l">
                        <div class="card is-2-columns-medium-screen is-3-columns-large-screen">
                            <Bandwith {period} on:change={(e) => changePeriod(e.detail)} />
                        </div>
                        <div class="card is-2-columns-medium-screen is-3-columns-large-screen">
                            <Requests {period} on:change={(e) => changePeriod(e.detail)} />
                        </div>
                        <a
                            href={`${base}/console/project-${projectId}/databases`}
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
                                        {format(total($usage.documentsTotal))}
                                    </div>
                                    <div>Documents</div>
                                </div>

                                <div class="grid-item-1-end-end">
                                    <div class="text">
                                        Databases: {format(total($usage.databasesTotal))}
                                    </div>
                                </div>
                            </div>
                        </a>
                        <a
                            href={`${base}/console/project-${projectId}/storage`}
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
                                        Buckets: {format(total($usage.bucketsTotal))}
                                    </div>
                                </div>
                            </div>
                        </a>
                        <a
                            href={`${base}/console/project-${projectId}/auth`}
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
                                        {format(total($usage.usersTotal))}
                                    </div>
                                    <div>Users</div>
                                </div>
                            </div>
                        </a>
                        <a
                            href={`${base}/console/project-${projectId}/functions`}
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
                                        {format(total($usage.executionsTotal))}
                                    </div>
                                    <div>Executions</div>
                                </div>

                                <div class="grid-item-1-end-end">
                                    <div class="text" />
                                </div>
                            </div>
                        </a>
                        <div
                            class="card is-2-columns-medium-screen is-2-columns-large-screen is-2-rows-large-screen is-location-row-2-end-large-screen">
                            <Realtime />
                        </div>
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
        {/if}
    </Container>
{/if}
