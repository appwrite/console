<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import {
        CardContainer,
        Empty,
        GridItem1,
        Id,
        PaginationWithLimit,
        SvgIcon
    } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container, ContainerHeader } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    import { templatesList } from '$lib/stores/templates';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import Initial from '$lib/wizards/functions/cover.svelte';
    import CreateTemplate from '$lib/wizards/functions/createTemplate.svelte';
    import {
        templateConfig as templateConfigStore,
        template as templateStore
    } from '$lib/wizards/functions/store.js';
    import { parseExpression } from 'cron-parser';
    import { onMount } from 'svelte';
    import { functionsList } from './store';
    import { canWriteFunctions } from '$lib/stores/roles';
    import type { Models } from '@appwrite.io/console';

    export let data;

    let offset = 0;

    const project = $page.params.project;

    onMount(async () => {
        const from = $page.url.searchParams.get('from');
        if (from === 'github') {
            const to = $page.url.searchParams.get('to');
            switch (to) {
                case 'template': {
                    const step = $page.url.searchParams.get('step');
                    const template = $page.url.searchParams.get('template');
                    const templateConfig = $page.url.searchParams.get('templateConfig');
                    templateStore.set(
                        (await $templatesList).templates.find((item) => item.id === template)
                    );
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

    function getNextScheduledExecution(func: Models.Function) {
        return toLocaleDateTime(parseExpression(func.schedule, { utc: true }).next().toString());
    }

    $: $registerCommands([
        {
            label: 'Create function',
            callback: openWizard,
            keys: ['c'],
            disabled:
                $wizard.show ||
                isServiceLimited('functions', $organization?.billingPlan, $functionsList?.total) ||
                !$canWriteFunctions,
            icon: 'plus',
            group: 'functions'
        }
    ]);

    $updateCommandGroupRanks({ functions: 1000 });
</script>

<Container>
    <ContainerHeader
        title="Functions"
        buttonText={$canWriteFunctions ? 'Create function' : ''}
        buttonEvent="create_function"
        buttonMethod={openWizard}
        total={data.functions.total} />

    {#if data.functions.total}
        <CardContainer
            {offset}
            showEmpty={$canWriteFunctions}
            event="functions"
            total={data.functions.total}
            on:click={openWizard}
            service="functions">
            {#each data.functions.functions as func}
                <GridItem1
                    href={`${base}/project-${$page.params.region}-${project}/functions/function-${func.$id}`}>
                    <svelte:fragment slot="title">
                        <div class="u-flex u-gap-16 u-cross-center">
                            <div class="avatar is-medium">
                                <SvgIcon name={func.runtime.split('-')[0]}></SvgIcon>
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
                                        ${getNextScheduledExecution(func)}`
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
            allowCreate={$canWriteFunctions}
            href="https://appwrite.io/docs/products/functions"
            target="function"
            on:click={openWizard} />
    {/if}
</Container>
