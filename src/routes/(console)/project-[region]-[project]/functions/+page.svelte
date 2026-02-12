<script lang="ts">
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
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    let offset = $state(0);

    const createFunctionsUrl = $derived.by(() => {
        return resolveRoute(
            '/(console)/project-[region]-[project]/functions/create-function',
            page.params
        );
    });

    const isLimited = $derived(isServiceLimited('functions', $organization, data.functions.total));

    onMount(async () => {
        const from = page.url.searchParams.get('from');
        if (from === 'github') {
            const to = page.url.searchParams.get('to');
            switch (to) {
                case 'template': {
                    const template = page.url.searchParams.get('template');
                    const templateConfig = page.url.searchParams.get('templateConfig');
                    const templateUrl = resolveRoute(
                        '/(console)/project-[region]-[project]/functions/create-function/template-[template]',
                        {
                            ...page.params,
                            template
                        }
                    );

                    if (!templateConfig) {
                        await goto(templateUrl);
                    } else {
                        await goto(withPath(templateUrl, `?templateConfig=${templateConfig}`));
                    }

                    break;
                }
                case 'cover':
                    await goto(createFunctionsUrl);
                    break;
            }
        }
    });

    function getNextScheduledExecution(func: Models.Function) {
        return toLocaleDateTime(parseExpression(func.schedule, { utc: true }).next().toString());
    }

    $effect(() => {
        $registerCommands([
            {
                label: 'Create function',
                callback: () => goto(createFunctionsUrl),
                keys: ['c'],
                disabled:
                    $wizard.show ||
                    isServiceLimited('functions', $organization, data.functions?.total) ||
                    !$canWriteFunctions,
                icon: IconPlus,
                group: 'functions'
            }
        ]);
    });

    $effect(() => {
        $updateCommandGroupRanks({ functions: 1000 });
    });
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <SearchQuery placeholder="Search by name or ID" />

        <Tooltip disabled={!isLimited}>
            <div>
                <Button disabled={isLimited} href={createFunctionsUrl}>
                    <Icon icon={IconPlus} slot="start" />
                    Create function
                </Button>
            </div>
            <svelte:fragment slot="tooltip">
                You have reached the maximum number of functions for your plan.
            </svelte:fragment>
        </Tooltip>
    </Layout.Stack>

    {#if data.functions.total}
        <CardContainer
            {offset}
            disableEmpty={!$canWriteFunctions}
            event="functions"
            total={data.functions.total}
            service="functions"
            on:click={() => goto(createFunctionsUrl)}>
            {#each data.functions.functions as func (func.$id)}
                <GridItem1
                    href={resolveRoute(
                        '/(console)/project-[region]-[project]/functions/function-[function]',
                        {
                            ...page.params,
                            function: func.$id
                        }
                    )}>
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
            <Button
                secondary
                href={resolveRoute('/(console)/project-[region]-[project]/functions', page.params)}>
                Clear search
            </Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            allowCreate={$canWriteFunctions}
            href="https://appwrite.io/docs/products/functions"
            target="function"
            on:click={() => goto(createFunctionsUrl)} />
    {/if}
</Container>
