<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Container, ContainerHeader } from '$lib/layout';
    import { tooltip } from '$lib/actions/tooltip';
    import { CardContainer, Empty, GridItem1, Id, PaginationWithLimit } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import Initial from '$lib/wizards/functions/cover.svelte';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import CreateTemplate from '$lib/wizards/functions/createTemplate.svelte';
    import {
        templateConfig as templateConfigStore,
        template as templateStore
    } from '$lib/wizards/functions/store.js';
    import { marketplace } from '$lib/stores/marketplace.js';

    export let data;

    let offset = 0;

    const project = $page.params.project;

    onMount(() => {
        const from = $page.url.searchParams.get('from');
        if (from === 'github') {
            const to = $page.url.searchParams.get('to');
            switch (to) {
                case 'template': {
                    const step = $page.url.searchParams.get('step');
                    const template = $page.url.searchParams.get('template');
                    const templateConfig = $page.url.searchParams.get('templateConfig');
                    templateStore.set(marketplace.find((item) => item.id === template));
                    templateConfigStore.set(JSON.parse(templateConfig));
                    wizard.start(CreateTemplate);
                    wizard.setStep(Number(step));
                    break;
                }
                case 'cover':
                    openWizard();
                    break;
            }
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
            icon: 'plus',
            group: 'functions'
        }
    ]);

    $updateCommandGroupRanks({ functions: 1000 });
</script>

<Container>
    <ContainerHeader
        title="Functions"
        buttonText="Create function"
        buttonEvent="create_function"
        buttonMethod={openWizard}
        total={data.functions.total} />

    {#if data.functions.total}
        <CardContainer
            {offset}
            event="functions"
            total={data.functions.total}
            on:click={openWizard}
            service="functions">
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
            href="https://appwrite.io/docs/products/functions"
            target="function"
            on:click={openWizard} />
    {/if}
</Container>
