<script lang="ts">
    import { tabs, title, backButton, copyData } from '$lib/stores/layout';
    import { project } from '../store';
    import { Container } from '$lib/layout';
    import { page } from '$app/stores';
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    title.set($project.name);
    tabs.set([]);
    backButton.set('');

    copyData.set({
        text: '',
        value: ''
    });

    $: path = `/console/project-${$project.$id}/overview`;
    $: usage = sdkForConsole.projects.getUsage($project.$id, '30d');

    function last(set: Array<unknown>): Models.Metric | null {
        return (set as Models.Metric[]).slice(-1)[0] ?? null;
    }

    function total(set: Array<unknown>): number {
        return (set as Models.Metric[]).reduce((prev, curr) => prev + curr.value, 0);
    }

    const formatter = Intl.NumberFormat('en', {
        notation: 'compact'
    });

    function format(number: number): string {
        return formatter.format(number);
    }
</script>

<svelte:head>
    <title>Appwrite - Console</title>
</svelte:head>

{#if $project}
    <Container overlapCover>
        {#await usage then response}
            <section class="common-section">
                <div class="grid-dashboard-1s-2m-6l">
                    <div class="card is-2-columns-medium-screen is-3-columns-large-screen">
                        <div class="u-flex u-gap-16 u-main-space-between">
                            <div>
                                <div class="heading-level-4">
                                    {total(response.network)}
                                    <span class="body-text-2">KB</span>
                                </div>
                                <div>Bandwidth</div>
                            </div>
                            <div class="drop-wrapper u-cross-child-start">
                                <button class="transparent-button">
                                    <span class="text">30d</span>
                                    <span class="icon-cheveron-down" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card is-2-columns-medium-screen is-3-columns-large-screen">
                        <div class="u-flex u-gap-16 u-main-space-between">
                            <div>
                                <div class="heading-level-4">
                                    {format(total(response.requests))}
                                </div>
                                <div>Requests</div>
                            </div>
                            <div class="drop-wrapper u-cross-child-start">
                                <button class="transparent-button">
                                    <span class="text">30d</span>
                                    <span class="icon-cheveron-down" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
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
                                <div class="text">Documents: {last(response.documents).value}</div>
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
                                    8.0 <span class="body-text-2">MB</span>
                                </div>
                                <div>Users</div>
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
                                    {format(last(response.users).value)}
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
                                    {format(last(response.functions).value)}
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
        {/await}

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
