<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import {
        CardContainer,
        Empty,
        EmptySearch,
        GridItem1,
        Id,
        PaginationWithLimit,
        SearchQuery,
        SvgIcon
    } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';

    import { parseExpression } from 'cron-parser';
    import { onMount } from 'svelte';
    import { canWriteFunctions } from '$lib/stores/roles';
    import type { Models } from '@appwrite.io/console';
    import { Icon, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconClock, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import Avatar from '$lib/components/avatar.svelte';

    export let data;

    let offset = 0;

    const project = page.params.project;

    onMount(async () => {
        const from = page.url.searchParams.get('from');
        if (from === 'github') {
            const to = page.url.searchParams.get('to');
            switch (to) {
                case 'template': {
                    const template = page.url.searchParams.get('template');
                    const templateConfig = page.url.searchParams.get('templateConfig');
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
                isServiceLimited('functions', $organization?.billingPlan, data.functions?.total) ||
                !$canWriteFunctions,
            icon: IconPlus,
            group: 'functions'
        }
    ]);

    $updateCommandGroupRanks({ functions: 1000 });
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery search={data.search} placeholder="Search by name or ID" />

        <Button href={`${base}/project-${project}/functions/create-function`}>
            <Icon icon={IconPlus} slot="start" />
            Create function
        </Button>
    </Layout.Stack>

    {#if data.functions.total}
        <CardContainer
            {offset}
            showEmpty={$canWriteFunctions}
            event="functions"
            total={data.functions.total}
            service="functions"
            on:click={() => goto(`${base}/project-${project}/functions/create-function`)}>
            {#each data.functions.functions as func}
                <GridItem1 href={`${base}/project-${project}/functions/function-${func.$id}`}>
                    <svelte:fragment slot="title">
                        <Layout.Stack gap="l" alignItems="center" direction="row" inline>
                            <Avatar alt={func.name} size="m">
                                <SvgIcon name={func.runtime.split('-')[0]} />
                            </Avatar>
                            {func.name}
                        </Layout.Stack>
                    </svelte:fragment>
                    <svelte:fragment slot="icons">
                        {#if func.schedule}
                            <Tooltip>
                                <Icon icon={IconClock} size="s" />
                                <span slot="tooltip"
                                    >{`Next execution:
                                        ${getNextScheduledExecution(func)}`}</span>
                            </Tooltip>
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
    {:else if data?.search}
        <EmptySearch hidePages bind:search={data.search} target="functions">
            <Button secondary href={`${base}/project-${page.params.project}/functions`}>
                Clear search
            </Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            allowCreate={$canWriteFunctions}
            href="https://appwrite.io/docs/products/functions"
            target="function"
            on:click={() => goto(`${base}/project-${project}/functions/create-function`)} />
    {/if}
</Container>
