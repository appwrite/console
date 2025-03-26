<script lang="ts">
    import { base } from '$app/paths';
    import { EmptySearch, PaginationWithLimit, SvgIcon } from '$lib/components';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import Wizard from '$lib/layout/wizard.svelte';
    import { goto } from '$app/navigation';
    import { debounce } from '$lib/helpers/debounce.js';
    import { Card, Layout, Accordion, Selector, Tooltip } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import { app } from '$lib/stores/app.js';
    import { getFrameworkIcon } from '../../store.js';

    export let data;

    function applyFilter(filter: string, value: string, event: CustomEvent) {
        const target = new URL($page.url);
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
        goto(target.toString());
    }

    function applySearch(event: CustomEvent<string>) {
        debounce(() => {
            const value = event.detail;
            const target = new URL($page.url);

            if (value.length > 0) {
                target.searchParams.set('search', value);
            } else {
                target.searchParams.delete('search');
            }
            target.searchParams.delete('page');
            goto(target.toString(), { keepFocus: true });
        }, 250)();
    }

    function clearSearch() {
        const target = new URL($page.url);
        target.search = '';
        goto(target.toString());
    }

    $: isChecked = (useCase: string) => {
        return $page.url.searchParams
            .getAll('useCase')
            .some((param) => param.toLowerCase() === useCase.toLowerCase());
    };
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<Wizard
    href={`${base}/project-${$page.params.project}/sites/`}
    title="Create site"
    invertColumns
    stickySide
    hideFooter>
    <svelte:fragment slot="aside">
        <Layout.Stack gap="xl">
            <InputSearch
                placeholder="Search templates"
                value={$page.url.searchParams.get('search')}
                on:clear={clearSearch}
                on:change={applySearch} />

            <Layout.Stack>
                <Accordion title="Use case">
                    <Layout.Stack>
                        {#each [...data.useCases] as useCase}
                            <Layout.Stack direction="row" gap="s">
                                <Selector.Checkbox
                                    id={useCase}
                                    size="s"
                                    label={capitalize(useCase)}
                                    checked={isChecked(useCase)}
                                    on:change={(e) => {
                                        applyFilter('useCase', useCase, e);
                                    }} />
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Accordion>
                <Accordion title="Framework" open>
                    <Layout.Stack>
                        {#each [...data.frameworks] as framework}
                            {#if !framework.toLowerCase().includes('other')}
                                <Layout.Stack direction="row" gap="s">
                                    <Selector.Checkbox
                                        id={framework}
                                        size="s"
                                        label={framework?.split('-')?.join(' ')}
                                        checked={$page.url.searchParams
                                            .getAll('framework')
                                            .includes(framework)}
                                        on:change={(e) => applyFilter('framework', framework, e)} />
                                </Layout.Stack>
                            {/if}
                        {/each}
                        {#if data.frameworks.includes('Other')}
                            <Layout.Stack direction="row" gap="s">
                                <Selector.Checkbox
                                    id="other"
                                    size="s"
                                    label="Other"
                                    checked={$page.url.searchParams
                                        .getAll('framework')
                                        .includes('Other')}
                                    on:change={(e) => applyFilter('framework', 'Other', e)} />
                            </Layout.Stack>
                        {/if}
                    </Layout.Stack>
                </Accordion>
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>
    <Layout.Stack gap="l">
        {#if data.templates?.length > 0}
            <Layout.Grid columns={3} columnsXS={2} columnsXXS={1}>
                {#each data.templates as template}
                    {@const templateFrameworks = template.frameworks.map((t) => t.name)}

                    <Card.Link
                        variant="secondary"
                        href={`${base}/project-${$page.params.project}/sites/create-site/templates/template-${template.key}`}
                        padding="xxs">
                        <Card.Media
                            title={template.name}
                            src={$app.themeInUse === 'dark'
                                ? template?.screenshotDark ||
                                  `${base}/images/sites/screenshot-placeholder-dark.svg`
                                : template?.screenshotLight ||
                                  `${base}/images/sites/screenshot-placeholder-light.svg`}
                            alt={template.name}
                            avatar>
                            <svelte:fragment slot="avatar">
                                <Tooltip>
                                    <SvgIcon
                                        name={getFrameworkIcon(templateFrameworks[0])}
                                        iconSize="small" />
                                    <svelte:fragment slot="tooltip">
                                        {capitalize(templateFrameworks[0])}
                                    </svelte:fragment>
                                </Tooltip>
                            </svelte:fragment>
                        </Card.Media>
                    </Card.Link>
                {/each}
            </Layout.Grid>
        {:else}
            <EmptySearch
                hidePagination
                target="templates"
                search={$page.url.searchParams.get('search')}>
                <Button
                    secondary
                    href={`${base}/project-${$page.params.project}/sites/create-site/templates`}
                    >Clear search</Button>
            </EmptySearch>
        {/if}

        <PaginationWithLimit
            name="Templates"
            limit={data.limit}
            offset={data.offset}
            total={data.sum} />
    </Layout.Stack>
</Wizard>
