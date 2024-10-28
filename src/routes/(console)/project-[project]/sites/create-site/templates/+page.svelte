<script lang="ts">
    import { base } from '$app/paths';
    import {
        Collapsible,
        CollapsibleItem,
        EmptySearch,
        Pagination,
        SvgIcon
    } from '$lib/components';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import Wizard from '$lib/layout/wizard.svelte';
    import { goto } from '$app/navigation';
    import { debounce } from '$lib/helpers/debounce.js';
    import { Card, Layout } from '@appwrite.io/pink-svelte';
    import { templatesList } from '$lib/stores/templates.js';

    export let data;

    function applyFilter(filter: string, value: string, event: Event) {
        const add = (event.target as EventTarget & HTMLInputElement).checked;
        const target = new URL($page.url);
        if (add) {
            target.searchParams.append(filter, value);
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

    function getIconFromFramework(framework: string) {
        switch (true) {
            case framework.includes('node'):
                return 'node';
            case framework.includes('php'):
                return 'php';
            case framework.includes('ruby'):
                return 'ruby';
            case framework.includes('python'):
                return 'python';
            case framework.includes('dart'):
                return 'dart';
            case framework.includes('bun'):
                return 'bun';
            case framework.includes('go'):
                return 'go';
            default:
                return undefined;
        }
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
            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Use case</svelte:fragment>
                    <ul class="form-list u-row-gap-16">
                        {#each [...data.useCases] as useCase}
                            <li class="form-item">
                                <label class="u-flex u-cross-center u-gap-16">
                                    <input
                                        type="checkbox"
                                        class="is-small"
                                        checked={isChecked(useCase)}
                                        on:change={(e) => applyFilter('useCase', useCase, e)} />
                                    <span class="u-trim-1">{useCase}</span>
                                </label>
                            </li>
                        {/each}
                    </ul>
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Framework</svelte:fragment>
                    <ul class="form-list u-row-gap-16">
                        {#each [...data.frameworks] as framework}
                            {@const icon = getIconFromFramework(framework)}
                            <li class="form-item">
                                <label class="u-flex u-cross-center u-gap-16">
                                    <input
                                        type="checkbox"
                                        class="is-small"
                                        checked={$page.url.searchParams
                                            .getAll('framework')
                                            .includes(framework)}
                                        on:change={(e) => applyFilter('framework', framework, e)} />
                                    <div class="u-flex u-cross-center u-gap-8">
                                        <div class="avatar is-size-x-small">
                                            <SvgIcon name={icon} iconSize="small" />
                                        </div>
                                        <div class="u-trim-1 u-capitalize">
                                            {framework?.split('-')?.join(' ')}
                                        </div>
                                    </div>
                                </label>
                            </li>
                        {/each}
                    </ul>
                </CollapsibleItem>
            </Collapsible>
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
                        src={template?.preview ??
                            'https://f002.backblazeb2.com/file/meldiron-public/Desktop+-+2.png'}
                        alt={template.name}>
                    </Card.Media>
                </Card.Link>
            {/each}
        </ul>
    {:else}
        <EmptySearch hidePagination>
            <div class="common-section">
                <div class="u-text-center common-section">
                    <b class="body-text-2 u-bold">{getErrorMessage()}</b>
                    <p>There are no templates that match your search.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button secondary on:click={clearSearch}>Clear search</Button>
                </div>
            </div>
        </EmptySearch>
    {/if}
    <!-- <div class="u-flex u-margin-block-start-32 u-main-space-between u-cross-center">
        <p class="text">Total templates: {data.templates?.length}</p>
        <Pagination limit={data.limit} offset={data.offset} sum={data.templates?.length} />
    </div> -->
</Wizard>
