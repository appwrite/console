<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { EmptyFilter, EmptySearch, Paginator, SearchQuery, SvgIcon } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ContainerButton } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { canWriteFunctions } from '$lib/stores/roles';
    import type { Models } from '@appwrite.io/console';
    import { functionsList } from '../store';
    import {
        Accordion,
        AvatarGroup,
        Layout,
        Selector,
        Tooltip,
        Typography,
        Card as PinkCard
    } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import Card from '$lib/components/card.svelte';
    import Link from '$lib/elements/link.svelte';
    import Avatar from '$lib/components/avatar.svelte';
    import { getIconFromRuntime } from '$lib/stores/runtimes';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;

    let offset = 0;

    function applyFilter(filter: string, value: string, event: CustomEvent) {
        const target = new URL(page.url);
        if (event?.detail) {
            if (
                !target.searchParams
                    .getAll(filter)
                    .some((n) => n.toLowerCase() === value.toLowerCase())
            ) {
                target.searchParams.append(filter, value);
            }
        } else {
            const previous = target.searchParams
                .getAll(filter)
                .filter((n) => n.toLowerCase() !== value.toLowerCase());
            target.searchParams.delete(filter);
            previous.forEach((n) => target.searchParams.append(filter, n));
        }
        target.searchParams.delete('page');
        offset = 0;
        goto(target.toString(), {
            noScroll: true
        });
    }

    function clearSearch() {
        const target = new URL(page.url);
        target.search = '';
        goto(target.toString(), {
            noScroll: true
        });
    }

    function getBaseRuntimes(runtimes: Models.TemplateRuntime[]): Models.TemplateRuntime[] {
        const baseRuntimes = new Map<string, Models.TemplateRuntime>();
        for (const runtime of runtimes) {
            const [baseRuntime] = runtime.name.split('-');
            baseRuntimes.set(baseRuntime, {
                ...runtime,
                name: baseRuntime
            });
        }
        return [...baseRuntimes.values()];
    }

    const isChecked = (useCase: string) => {
        return page.url.searchParams
            .getAll('useCase')
            .some((param) => param.toLowerCase() === useCase.toLowerCase());
    };

    $: buttonDisabled = isServiceLimited(
        'functions',
        $organization?.billingPlan,
        $functionsList?.total ?? 0
    );
</script>

<Container>
    <Layout.GridFraction start={1} end={3} gap="xxl">
        <Layout.Stack gap="xl">
            <SearchQuery placeholder="Search template" />
            <Layout.Stack>
                <Accordion title="Use case">
                    <Layout.Stack>
                        {#each [...data.useCases] as useCase}
                            <Layout.Stack direction="row" gap="s">
                                <Selector.Checkbox
                                    id={useCase}
                                    size="s"
                                    label={useCase === 'ai'
                                        ? useCase.toUpperCase()
                                        : capitalize(useCase)}
                                    checked={isChecked(useCase)}
                                    on:change={(e) => {
                                        applyFilter('useCase', useCase, e);
                                    }} />
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Accordion>
                <Accordion title="Runtime">
                    <Layout.Stack>
                        {#each [...data.runtimes] as runtime}
                            <!-- {@const icon = getIconFromRuntime(runtime)} -->
                            <Layout.Stack direction="row" gap="s">
                                <Selector.Checkbox
                                    id={runtime}
                                    size="s"
                                    label={runtime?.split('-')?.join(' ')}
                                    checked={page.url.searchParams
                                        .getAll('runtime')
                                        .includes(runtime)}
                                    on:change={(e) => applyFilter('runtime', runtime, e)} />
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Accordion>
            </Layout.Stack>

            <Card radius="s" padding="xs">
                <Layout.Stack gap="xxxs">
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                        Contribute
                    </Typography.Text>
                    <Typography.Text variant="m-400">
                        Got a function template idea? <Link
                            variant="muted"
                            external
                            href="https://github.com/appwrite/templates/blob/main/CONTRIBUTING.md"
                            >View the contribution guidelines.
                        </Link>
                    </Typography.Text>
                </Layout.Stack>
            </Card>
        </Layout.Stack>
        <Layout.Stack gap="l">
            {#if data?.search && data.templates.length === 0}
                <EmptySearch hidePagination search={data.search}>
                    <Button secondary on:click={clearSearch}>Clear search</Button>
                </EmptySearch>
            {:else if data?.filter && data.templates.length === 0}
                <EmptyFilter resource="templates"></EmptyFilter>
            {:else}
                <Paginator items={data.templates} limit={12} hidePages={false} hasLimit bind:offset>
                    {#snippet children(paginatedItems: typeof data.templates)}
                        <Layout.Grid columns={2} columnsXL={3} columnsXS={1}>
                            {#each paginatedItems as template}
                                {@const baseRuntimes = getBaseRuntimes(template.runtimes)}
                                {@const displayed = baseRuntimes.slice(0, 2)}
                                {@const hidden = baseRuntimes.slice(1, -1)}
                                <PinkCard.Base radius="m" padding="xs">
                                    <Layout.Stack
                                        height="100%"
                                        justifyContent="space-between"
                                        gap="xl">
                                        <Layout.Stack gap="xxxs">
                                            <Typography.Text
                                                variant="m-500"
                                                color="--fgcolor-neutral-primary">
                                                {template.name}
                                            </Typography.Text>

                                            <Typography.Text variant="m-400">
                                                {template.tagline}
                                            </Typography.Text>
                                        </Layout.Stack>

                                        <Layout.Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center">
                                            <AvatarGroup>
                                                {#each displayed as runtime}
                                                    {@const icon = getIconFromRuntime(runtime.name)}
                                                    {#if icon}
                                                        <Avatar alt={runtime.name} size="xs">
                                                            <SvgIcon name={icon} iconSize="small" />
                                                        </Avatar>
                                                    {/if}
                                                {/each}
                                                {#if hidden.length}
                                                    <Tooltip>
                                                        <Avatar
                                                            alt="hidden runtime number"
                                                            size="xs">
                                                            <span style:font-size="10px">
                                                                +{hidden.length}
                                                            </span>
                                                        </Avatar>
                                                        <span slot="tooltip">
                                                            {hidden.map((n) => n.name).join(', ')}
                                                        </span>
                                                    </Tooltip>
                                                {/if}
                                            </AvatarGroup>
                                            <Layout.Stack
                                                direction="row"
                                                gap="s"
                                                alignItems="center"
                                                inline>
                                                <Button
                                                    href={getProjectRoute(
                                                        `/functions/templates/template-${template.id}`
                                                    )}
                                                    text>
                                                    <span class="text">Details</span>
                                                </Button>
                                                {#if $canWriteFunctions}
                                                    <ContainerButton
                                                        title="functions"
                                                        disabled={buttonDisabled}
                                                        buttonType="secondary"
                                                        buttonHref={getProjectRoute(
                                                            `/functions/create-function/template-${template.id}`
                                                        )}
                                                        showIcon={false}
                                                        buttonText="Create"
                                                        buttonEventData={{
                                                            source: 'functions_template'
                                                        }}
                                                        buttonEvent="create_function" />
                                                {/if}
                                            </Layout.Stack>
                                        </Layout.Stack>
                                    </Layout.Stack>
                                </PinkCard.Base>
                            {/each}
                        </Layout.Grid>
                    {/snippet}
                </Paginator>
            {/if}
        </Layout.Stack>
    </Layout.GridFraction>
</Container>
