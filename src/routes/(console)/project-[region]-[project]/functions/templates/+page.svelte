<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip.js';
    import {
        Collapsible,
        CollapsibleItem,
        EmptySearch,
        Heading,
        Pagination,
        SvgIcon
    } from '$lib/components';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { Container, ContainerButton } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { isServiceLimited } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { canWriteFunctions } from '$lib/stores/roles';
    import { connectTemplate } from '$lib/wizards/functions/cover.svelte';
    import type { Models } from '@appwrite.io/console';
    import { functionsList } from '../store';
    import { debounce } from '$lib/helpers/debounce';
    import { capitalize } from '$lib/helpers/string';

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

    function clearSearch() {
        const target = new URL($page.url);
        target.search = '';
        goto(target.toString());
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

    function getIconFromRuntime(runtime: string) {
        switch (true) {
            case runtime.includes('node'):
                return 'node';
            case runtime.includes('php'):
                return 'php';
            case runtime.includes('ruby'):
                return 'ruby';
            case runtime.includes('python'):
                return 'python';
            case runtime.includes('dart'):
                return 'dart';
            case runtime.includes('bun'):
                return 'bun';
            case runtime.includes('go'):
                return 'go';
            case runtime.includes('deno'):
                return 'deno';
            default:
                return undefined;
        }
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

    $: buttonDisabled = isServiceLimited(
        'functions',
        $organization?.billingPlan,
        $functionsList?.total ?? 0
    );
</script>

<Container>
    <div class="u-flex u-gap-8 u-cross-center">
        <Heading tag="h2" size="5">Templates</Heading>
        <div class="tag eyebrow-heading-3">
            <span class="text u-x-small">Experimental</span>
        </div>
    </div>
    <div class="grid-300px-1fr u-margin-block-start-24">
        <section>
            <InputSearch
                placeholder="Search templates"
                value={$page.url.searchParams.get('search')}
                on:clear={clearSearch}
                on:change={applySearch} />
            <div class="u-margin-block-start-24">
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
                                        <span class="u-trim-1">{capitalize(useCase)}</span>
                                    </label>
                                </li>
                            {/each}
                        </ul>
                    </CollapsibleItem>
                    <CollapsibleItem>
                        <svelte:fragment slot="title">Runtime</svelte:fragment>
                        <ul class="form-list u-row-gap-16">
                            {#each [...data.runtimes] as runtime}
                                {@const icon = getIconFromRuntime(runtime)}
                                <li class="form-item">
                                    <label class="u-flex u-cross-center u-gap-16">
                                        <input
                                            type="checkbox"
                                            class="is-small"
                                            checked={$page.url.searchParams
                                                .getAll('runtime')
                                                .includes(runtime)}
                                            on:change={(e) => applyFilter('runtime', runtime, e)} />
                                        <div
                                            class="u-flex u-cross-center u-gap-8 functions-avatar-holder">
                                            <div class="avatar is-size-x-small">
                                                <SvgIcon name={icon} iconSize="small" />
                                            </div>
                                            <div class="u-trim-1 u-capitalize">
                                                {runtime?.split('-')?.join(' ')}
                                            </div>
                                        </div>
                                    </label>
                                </li>
                            {/each}
                        </ul>
                    </CollapsibleItem>
                </Collapsible>
            </div>

            <section class="card u-margin-block-start-24">
                <h4 class="body-text-1 u-bold">Contribute</h4>
                <p class="u-margin-block-start-16">
                    Have an idea for a function template? View our <a
                        class="link"
                        href="https://github.com/appwrite/templates/blob/main/CONTRIBUTING.md"
                        target="_blank">contribution guidelines</a
                    >.
                </p>
            </section>
        </section>
        <section>
            {#if data.templates.length > 0}
                <ul
                    class="grid-box"
                    style="--grid-item-size:22rem; --grid-item-size-small-screens:19rem">
                    {#each data.templates as template}
                        {@const baseRuntimes = getBaseRuntimes(template.runtimes)}
                        {@const displayed = baseRuntimes.slice(0, 2)}
                        {@const hidden = baseRuntimes.slice(1, -1)}
                        <li>
                            <article class="card u-min-height-100-percent">
                                <div class="u-flex u-gap-16 u-cross-center u-main-space-between">
                                    <h2
                                        class="body-text-1 u-bold u-trim-1 functions-template-title">
                                        {template.name}
                                    </h2>
                                    <ul class="avatars-group is-with-border">
                                        {#each displayed as runtime}
                                            {@const icon = getIconFromRuntime(runtime.name)}
                                            {#if icon}
                                                <li
                                                    class="avatars-group-item functions-avatar-holder">
                                                    <div class="avatar is-size-small">
                                                        <img
                                                            style:--p-text-size="20px"
                                                            src={`${base}/icons/${$app.themeInUse}/color/${icon}.svg`}
                                                            alt={icon}
                                                            aria-hidden="true"
                                                            aria-label={icon} />
                                                    </div>
                                                </li>
                                            {/if}
                                        {/each}
                                        {#if hidden.length}
                                            <li class="avatars-group-item functions-avatar-holder">
                                                <div
                                                    class="avatar is-size-small"
                                                    use:tooltip={{
                                                        content: hidden
                                                            .map((n) => n.name)
                                                            .join(', ')
                                                    }}>
                                                    +{hidden.length}
                                                </div>
                                            </li>
                                        {/if}
                                    </ul>
                                </div>

                                <p class="u-margin-block-start-20 u-trim-2 u-break-word">
                                    {template.tagline}
                                </p>

                                <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24">
                                    <Button
                                        href={`${base}/project-${$page.params.region}-${$page.params.project}/functions/templates/template-${template.id}`}
                                        text>
                                        <span class="text">View details</span>
                                    </Button>
                                    {#if $canWriteFunctions}
                                        <ContainerButton
                                            title="functions"
                                            disabled={buttonDisabled}
                                            buttonType="secondary"
                                            buttonMethod={() => connectTemplate(template)}
                                            showIcon={false}
                                            buttonText="Create function"
                                            buttonEvent="create_function" />
                                    {/if}
                                </div>
                            </article>
                        </li>
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
            <div class="u-flex u-margin-block-start-32 u-main-space-between u-cross-center">
                <p class="text">Total templates: {data.sum}</p>
                <Pagination limit={data.limit} offset={data.offset} sum={data.sum} />
            </div>
        </section>
    </div>
</Container>

<style>
    :global(.theme-light .functions-avatar-holder .avatar) {
        background-color: var(--p-avatar-bg-color-default);
        --p-avatar-bg-color-default: hsl(var(--color-neutral-0));
    }

    :global(.theme-light .functions-template-title) {
        color: hsl(var(--color-neutral-70));
    }

    :global(.theme-dark .functions-template-title) {
        color: hsl(var(--color-neutral-15));
    }
</style>
