<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { Empty, CardContainer, Copy, GridItem1, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { tooltip } from '$lib/actions/tooltip';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { beforeNavigate } from '$app/navigation';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Create from '../createFunction.svelte';
    import type { PageData } from './$types';
    import { CARD_LIMIT } from '$lib/constants';

    export let data: PageData;

    let offset = 0;

    const project = $page.params.project;

    function openWizard() {
        wizard.start(Create);
    }

    beforeNavigate(() => {
        wizard.hide();
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Functions</Heading>
        <Button on:click={openWizard}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create function</span>
        </Button>
    </div>

    {#if data.functions.total}
        <CardContainer total={data.functions.total} {offset} on:click={openWizard}>
            {#each data.functions.functions as func}
                <GridItem1
                    href={`${base}/console/project-${project}/functions/function-${func.$id}`}>
                    <svelte:fragment slot="title">
                        <div class="u-flex u-gap-32 u-cross-center">
                            <div class="avatar is-medium">
                                <img
                                    src={`${base}/icons/${$app.themeInUse}/color/${
                                        func.runtime.split('-')[0]
                                    }.svg`}
                                    alt="technology" />
                            </div>
                            <span class="text">{func.name}</span>
                        </div>
                    </svelte:fragment>
                    <svelte:fragment slot="status">
                        <!-- {#if deployments && deployments[func.$id]}
                            {deployments[func.$id].status ?? 'No deployment'}
                        {/if} -->
                    </svelte:fragment>
                    <svelte:fragment slot="icons">
                        <!-- {#if deployments && deployments[func.$id] && deployments[func.$id].status === 'failed'}
                            <li>
                                <span
                                    class="icon-exclamation"
                                    aria-hidden="true"
                                    use:tooltip={{
                                        content: 'Build error'
                                    }} />
                            </li>
                        {/if} -->
                        {#if func.scheduleNext}
                            <li>
                                <span
                                    class="icon-clock"
                                    aria-hidden="true"
                                    use:tooltip={{
                                        content: `Next execution: 
                                        ${toLocaleDateTime(func.scheduleNext)}`
                                    }} />
                            </li>
                        {/if}
                    </svelte:fragment>

                    <Copy value={func.$id}>
                        <Pill button><i class="icon-duplicate" />Function ID</Pill>
                    </Copy>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new function</p>
            </svelte:fragment>
        </CardContainer>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.functions.total}</p>
            <Pagination
                limit={CARD_LIMIT}
                path={`/console/project-${$page.params.project}/functions`}
                offset={data.offset}
                sum={data.functions.total} />
        </div>
    {:else}
        <Empty single on:click={openWizard}>
            <div class="u-text-center">
                <p class="text u-line-height-1-5">Create your first function to get started</p>
                <p class="text u-line-height-1-5">Need a hand? Check out our documentation.</p>
            </div>
            <div class="u-flex u-gap-16">
                <Button href="https://appwrite.io/docs/functions" external text>
                    Documentation
                </Button>
                <Button secondary on:click={openWizard}>Create function</Button>
            </div>
        </Empty>
    {/if}
</Container>
