<script lang="ts">
    import { page } from '$app/stores';
    // import { tooltip } from '$lib/actions/tooltip';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, GridHeader } from '$lib/layout';
    // import { app } from '$lib/stores/app';
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
    import type { PageData } from './$types';
    import Grid from './grid.svelte';
    import Table from './table.svelte';

    import { columns } from './store';
    // import { vi } from 'vitest';

    export let data: PageData;

    let offset = 0;

    // const project = $page.params.project;

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
    <GridHeader
        title="Functions"
        view={data.view}
        {columns}
        hideColumns={!data.functions.total}
        hideView={!data.functions.total}>
        <Button on:click={openWizard}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create Function</span>
        </Button>
    </GridHeader>

    {#if data.functions.total}
        {#if data.view === 'grid'}
            <Grid {data} {offset} {openWizard} />
        {:else}
            <Table {data} />
        {/if}

        <PaginationWithLimit
            name="Functions"
            limit={data.limit}
            offset={data.offset}
            total={data.functions.total} />
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/functions/deployment"
            target="function"
            on:click={openWizard} />
    {/if}
</Container>
