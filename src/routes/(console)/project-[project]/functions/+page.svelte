<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
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
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';

    import { parseExpression } from 'cron-parser';
    import { onMount } from 'svelte';
    import { functionsList } from './store';
    import { canWriteFunctions } from '$lib/stores/roles';
    import type { Models } from '@appwrite.io/console';
    import { Tooltip } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { goto } from '$app/navigation';

    export let data;

    let offset = 0;

    const project = $page.params.project;

    onMount(async () => {
        const from = $page.url.searchParams.get('from');
        if (from === 'github') {
            const to = $page.url.searchParams.get('to');
            switch (to) {
                case 'template': {
                    const template = $page.url.searchParams.get('template');
                    const templateConfig = $page.url.searchParams.get('templateConfig');
                    goto(
                        `${base}/project-${project}/functions/create-function/template-${template}?templateConfig=${templateConfig}`
                    );
                    break;
                }
                case 'cover':
                    goto(`${base}/project-${project}/functions/create-function`);
                    break;
            }
        }
    });

    function getNextScheduledExecution(func: Models.Function) {
        return toLocaleDateTime(parseExpression(func.schedule, { utc: true }).next().toString());
    }

    $: $registerCommands([
        {
            label: 'Create function',
            callback: () => goto(`${base}/project-${project}/functions/create-function`),
            keys: ['c'],
            disabled:
                $wizard.show ||
                isServiceLimited('functions', $organization?.billingPlan, $functionsList?.total) ||
                !$canWriteFunctions,
            icon: IconPlus,
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
        buttonHref={`${base}/project-${project}/functions/create-function`}
        total={data.functions.total} />

    {#if data.functions.total}
        <CardContainer
            {offset}
            showEmpty={$canWriteFunctions}
            event="functions"
            total={data.functions.total}
            service="functions">
            {#each data.functions.functions as func}
                <GridItem1 href={`${base}/project-${project}/functions/function-${func.$id}`}>
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
                                <Tooltip>
                                    <span class="icon-clock" aria-hidden="true" />
                                    <span slot="tooltip"
                                        >{`Next execution:
                                        ${getNextScheduledExecution(func)}`}</span>
                                </Tooltip>
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
        <!-- TODO: use new empty state -->
        <Empty
            single
            allowCreate={$canWriteFunctions}
            href="https://appwrite.io/docs/products/functions"
            target="function"
            on:click={() => goto(`${base}/project-${project}/functions/create-function`)} />
    {/if}
</Container>
