<script lang="ts">
    import { base } from '$app/paths';
    import { Collapsible, CollapsibleItem, EmptySearch, Pagination } from '$lib/components';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import WizardCover from '$lib/layout/wizardCover.svelte';
    import { goto } from '$app/navigation';
    import { repository } from '$lib/stores/vcs';
    import { debounce } from '$lib/helpers/debounce.js';
    import { Card } from '@appwrite.io/pink-svelte';

    export let data;
    let hasInstallations: boolean;
    let selectedRepository: string;

    function connect(event: CustomEvent<Models.ProviderRepository>) {
        trackEvent('click_connect_repository', {
            from: 'cover'
        });
        repository.set(event.detail);
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
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<WizardCover previousPage={`${base}/project-${$page.params.project}/sites/`}>
    <svelte:fragment slot="title">Create Site</svelte:fragment>
    <div class="wizard-container container"></div>

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
                            <!-- {#each [...data.useCases] as useCase}
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
                            {/each} -->
                        </ul>
                    </CollapsibleItem>
                    <CollapsibleItem>
                        <svelte:fragment slot="title">Runtime</svelte:fragment>
                        <ul class="form-list u-row-gap-16">
                            <!-- {#each [...data.runtimes] as runtime}
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
                                        <div class="u-flex u-cross-center u-gap-8">
                                            <div class="avatar is-size-x-small">
                                                <SvgIcon name={icon} iconSize="small" />
                                            </div>
                                            <div class="u-trim-1 u-capitalize">
                                                {runtime?.split('-')?.join(' ')}
                                            </div>
                                        </div>
                                    </label>
                                </li>
                            {/each} -->
                        </ul>
                    </CollapsibleItem>
                </Collapsible>
            </div>
        </section>
        <section>
            {#if data.siteTemplates.templates?.length > 0}
                <ul
                    class="grid-box"
                    style="--grid-item-size:22rem; --grid-item-size-small-screens:19rem">
                    {#each data.siteTemplates.templates as template}
                        <Card.Link
                            href={`${base}/project-${$page.params.project}/sites/create-site/configuration?template=${template.$id}`}
                            padding="x-small">
                            <Card.Media
                                title={template.name}
                                description={template.description}
                                src={template.preview}
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
            <div class="u-flex u-margin-block-start-32 u-main-space-between u-cross-center">
                <p class="text">Total templates: {data.siteTemplates.templates?.length}</p>
                <Pagination
                    limit={data.limit}
                    offset={data.offset}
                    sum={data.siteTemplates.templates?.length} />
            </div>
        </section>
    </div>
</WizardCover>

<style lang="scss">
    .git-container .overlay {
        background: linear-gradient(
            0,
            hsl(var(--p-card-bg-color)) 68.91%,
            hsl(var(--p-card-bg-color) / 0.5) 92.8%
        );
    }
</style>
