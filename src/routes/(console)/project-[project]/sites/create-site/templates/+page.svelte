<script lang="ts">
    import { base } from '$app/paths';
    import { EmptySearch } from '$lib/components';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import Wizard from '$lib/layout/wizard.svelte';
    import { goto } from '$app/navigation';
    import { debounce } from '$lib/helpers/debounce.js';
    import { Card, Layout, Accordion, Selector } from '@appwrite.io/pink-svelte';
    import { templatesList } from '$lib/stores/templates.js';

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

    $: getErrorMessage = () => {
        const searchParams = $page.url.searchParams;
        const paramsArray = Array.from(searchParams.entries());

        if (paramsArray.length === 1) {
            const [_, value] = paramsArray[0];
            return `Sorry, we couldn't find "${value}".`;
        } else if (paramsArray.length > 1) {
            return `Sorry, we couldn't find any results with the applied filters.`;
        }
    };
    $: console.log(templatesList);
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<Wizard href={`${base}/project-${$page.params.project}/sites/`} title="Create Site" invertColumns>
    <svelte:fragment slot="aside">
        <Layout.Stack gap="xxl">
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
                                    label={useCase}
                                    checked={isChecked(useCase)}
                                    on:change={(e) => {
                                        applyFilter('useCase', useCase, e);
                                    }} />
                            </Layout.Stack>
                        {/each}
                    </Layout.Stack>
                </Accordion>
                <Accordion title="Framework">
                    <Layout.Stack>
                        {#each [...data.frameworks] as framework}
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
                        {/each}
                    </Layout.Stack>
                </Accordion>
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>

    {#if data.templates?.length > 0}
        <ul
            class="grid-box"
            style="--grid-item-size:18rem; --grid-item-size-small-screens:19rem; --grid-gap: 12px">
            {#each data.templates as template}
                {@const templateFrameworks = template.frameworks.map((t) => t.name)}
                <Card.Link
                    variant="secondary"
                    href={`${base}/project-${$page.params.project}/sites/create-site/templates/template-${template.key}`}
                    padding="xs">
                    <Card.Media
                        title={template.name}
                        description={templateFrameworks.join(', ')}
                        src={template.demoImage}
                        alt={template.name}>
                    </Card.Media>
                </Card.Link>
            {/each}
        </ul>
    {:else}
        <EmptySearch
            hidePagination
            target="templates"
            search={$page.url.searchParams.get('search')}>
            <Button secondary on:click={clearSearch}>Clear search</Button>
        </EmptySearch>
    {/if}
    <!-- <div class="u-flex u-margin-block-start-32 u-main-space-between u-cross-center">
        <p class="text">Total templates: {data.templates?.length}</p>
        <Pagination limit={data.limit} offset={data.offset} sum={data.templates?.length} />
    </div> -->
</Wizard>
