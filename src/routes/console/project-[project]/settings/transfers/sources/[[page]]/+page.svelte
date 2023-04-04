<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { Empty, CardContainer, Copy, GridItem1, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { beforeNavigate } from '$app/navigation';
    import Create from '../../createSource.svelte';
    import type { PageData } from './$types';
    import { CARD_LIMIT } from '$lib/constants';
    import { onMount } from 'svelte';

    export let data: PageData;

    let offset = 0;

    const project = $page.params.project;

    function openWizard() {
        wizard.start(Create);
    }

    beforeNavigate(() => {
        wizard.hide();
    });

    onMount(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('openWizard')) {
            openWizard();

            params.delete('openWizard');
            window.history.replaceState({}, '', `${window.location.pathname}`);
        }
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">All Sources</Heading>
        <Button on:click={openWizard} event="create_transfer">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create source</span>
        </Button>
    </div>

    {#if data.sources.total}
        <CardContainer {offset} event="transfers" total={data.sources.total} on:click={openWizard}>
            {#each data.sources.sources as source}
                <GridItem1
                    href={`${base}/console/project-${project}/settings/transfers/sources/source-${source.$id}`}>
                    <svelte:fragment slot="title">
                        <div class="u-flex u-gap-16 u-cross-center">
                            <div class="image-item">
                                <img
                                    src={`${base}/icons/${$app.themeInUse}/color/${source.type}.svg`}
                                    alt="technology" />
                            </div>
                            <span class="text">{source.name}</span>
                        </div>
                    </svelte:fragment>

                    <Copy value={source.$id} event="source">
                        <Pill button><i class="icon-duplicate" />Source ID</Pill>
                    </Copy>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new source</p>
            </svelte:fragment>
        </CardContainer>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.sources.total}</p>
            <Pagination
                limit={CARD_LIMIT}
                path={`/console/project-${$page.params.project}/sources`}
                offset={data.offset}
                sum={data.sources.total} />
        </div>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/transfers#createSource"
            target="sources"
            on:click={openWizard} />
    {/if}
</Container>
