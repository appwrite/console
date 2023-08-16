<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import {
        CardContainer,
        Empty,
        GridItem1,
        Heading,
        Id,
        PaginationWithLimit
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import Initial from '$lib/wizards/functions/cover.svelte';
    import { registerCommands } from '$lib/commandCenter';

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

    $: $registerCommands([
        {
            label: 'Create function',
            callback: openWizard,
            keys: ['c'],
            disabled: $wizard.show,
            icon: 'plus'
        }
    ]);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Functions</Heading>
        <Button on:click={openWizard} event="create_function">
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
