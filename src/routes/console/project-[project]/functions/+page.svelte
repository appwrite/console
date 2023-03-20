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
    import Create from './createFunction.svelte';
    import type { PageData } from './$types';

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
        <Button on:click={openWizard} event="create_function">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create function</span>
        </Button>
    </div>

    {#if data.functions.total}
        <CardContainer
            {offset}
            event="functions"
            total={data.functions.total}
            on:click={openWizard}>
            {#each data.functions.functions as func}
                <GridItem1
                    href={`${base}/console/project-${project}/functions/function-${func.$id}`}>
                    <svelte:fragment slot="title">
                        <div class="u-flex u-gap-16 u-cross-center">
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
                    <svelte:fragment slot="icons">
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

                    <Copy value={func.$id} event="function">
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
            <Pagination limit={data.limit} offset={data.offset} sum={data.functions.total} />
        </div>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/functions#deployFunction"
            target="function"
            on:click={openWizard} />
    {/if}
</Container>
