<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { Empty, EmptyGridItem, Pagination, Copy, GridItem1 } from '$lib/components';
    import { Pill } from '$lib/elements';
    import type { Models } from '@aw-labs/appwrite-console';
    import Create from './createFunction.svelte';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { tooltip } from '$lib/actions/tooltip';
    import { functionList } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { app } from '$lib/stores/app';
    import { onMount } from 'svelte';
    import { wizard } from '$lib/stores/wizard';
    import { beforeNavigate } from '$app/navigation';

    let search = '';
    let offset = 0;

    const limit = 6;
    const project = $page.params.project;

    let deployments: Record<string, Models.Deployment> = null;
    onMount(async () => {
        deployments = await functionList.getDeployments($functionList.functions);
    });

    function openWizard() {
        wizard.start(Create);
    }

    beforeNavigate(() => {
        wizard.hide();
    });

    $: functionList.load(search, limit, offset ?? 0);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Functions</h2>

        <Button on:click={openWizard}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create function</span>
        </Button>
    </div>

    {#if $functionList?.total}
        <div
            class="grid-box common-section"
            style={` --grid-item-size:${$functionList.total > 3 ? '22rem' : '25rem'};`}>
            {#each $functionList.functions as func}
                <GridItem1
                    href={`${base}/console/project-${project}/functions/function/${func.$id}`}>
                    <svelte:fragment slot="title">
                        <div class="u-flex u-gap-32 u-cross-center">
                            <div class="avatar is-medium">
                                <img
                                    src={`${base}/icons/${$app.themeInUse}/color/${
                                        func.runtime.split('-')[0]
                                    }.svg`}
                                    alt="technology" />
                            </div>
                            <span class="text"> {func.name}</span>
                        </div>
                    </svelte:fragment>
                    <svelte:fragment slot="status">
                        {#if deployments && deployments[func.$id]}
                            {deployments[func.$id].status ?? 'No deployment'}
                        {/if}
                    </svelte:fragment>
                    <svelte:fragment slot="icons">
                        {#if deployments && deployments[func.$id] && deployments[func.$id].status === 'failed'}
                            <li>
                                <span
                                    class="icon-exclamation"
                                    aria-hidden="true"
                                    use:tooltip={{
                                        content: 'Build error'
                                    }} />
                            </li>
                        {/if}
                        {#if func.scheduleNext}
                            <li>
                                <span
                                    class="icon-clock"
                                    aria-hidden="true"
                                    use:tooltip={{
                                        content: `Next execution: ${toLocaleDateTime(
                                            func.scheduleNext
                                        )}`
                                    }} />
                            </li>
                        {/if}
                    </svelte:fragment>

                    <Copy value={func.$id}>
                        <Pill button><i class="icon-duplicate" />Function ID</Pill>
                    </Copy>
                </GridItem1>
            {/each}
            {#if ($functionList.total % 2 !== 0 || $functionList.total % 4 === 0) && $functionList.total - offset <= limit}
                <EmptyGridItem on:click={openWizard}>
                    <div class="common-section">
                        <Button secondary round>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p>Create a new function</p>
                    </div>
                </EmptyGridItem>
            {/if}
        </div>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$functionList.total}</p>
            <Pagination {limit} bind:offset sum={$functionList.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={openWizard}>
                        <i class="icon-plus" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Create your first function to get started</p>
                </div>
                <div class="common-section">
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/functions#createFunction"
                        >Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>
