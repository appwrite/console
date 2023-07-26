<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        CardContainer,
        GridItem1,
        Heading,
        PaginationWithLimit,
        Id
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { tooltip } from '$lib/actions/tooltip';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { onMount } from 'svelte';
    import Initial from '$lib/wizards/functions/cover.svelte';

    export let data;

    let offset = 0;

    const project = $page.params.project;

    onMount(() => {
        if ($page.url.searchParams.has('github-installed')) {
            openWizard();
        }
    });

    function openWizard() {
        wizard.showCover(Initial);
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Functions</Heading>
        <Button on:click={openWizard} event="create_attribute">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create function</span>
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
                        {#if func.schedule}
                            <li>
                                <span
                                    class="icon-clock"
                                    aria-hidden="true"
                                    use:tooltip={{
                                        content: `Next execution: 
                                        ${toLocaleDateTime(func.schedule)}`
                                    }} />
                            </li>
                        {/if}
                    </svelte:fragment>
                    <Id value={func.$id} event="function">{func.$id}</Id>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new function</p>
            </svelte:fragment>
        </CardContainer>

        <PaginationWithLimit
            name="Functions"
            limit={data.limit}
            offset={data.offset}
            total={data.functions.total} />
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/functions#deployFunction"
            target="function"
            on:click={openWizard} />
    {/if}
</Container>
