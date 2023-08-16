<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Collapsible, CollapsibleItem, Pagination } from '$lib/components';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { connectTemplate } from '$lib/wizards/functions/cover.svelte';

    export let data;

    let searchElement: HTMLInputElement;

    function applyFilter(filter: string, value: string, event: Event) {
        const add = (event.target as EventTarget & HTMLInputElement).checked;
        const target = new URL($page.url);
        if (add) {
            target.searchParams.append(filter, value);
        } else {
            const previous = target.searchParams.getAll(filter).filter((n) => n !== value);
            target.searchParams.delete(filter);
            previous.forEach((n) => target.searchParams.append(filter, n));
        }
        target.searchParams.delete('page');
        goto(target.toString());
    }

    function applySearch(event: Event) {
        const value = (event.target as EventTarget & HTMLInputElement).value;
        const target = new URL($page.url);

        if (value.length > 0) {
            target.searchParams.set('search', value);
        } else {
            target.searchParams.delete('search');
        }
        target.searchParams.delete('page');
        goto(target.toString(), { keepFocus: true });
    }

    function clearSearch() {
        const target = new URL($page.url);
        target.searchParams.delete('page');
        target.searchParams.delete('search');
        searchElement.value = '';
        goto(target.toString());
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
            default:
                return undefined;
        }
    }
</script>

<Container>
    <div class="grid-300px-1fr">
        <section>
            <h3 class="body-text-1 u-bold">Filter templates</h3>
            <div
                class="input-text-wrapper is-with-end-button u-width-full-line u-max-width-500 u-margin-block-start-12"
                style="--amount-of-buttons:1">
                <input
                    bind:this={searchElement}
                    on:input={applySearch}
                    type="search"
                    placeholder="Search templates" />
                <div class="icon-search" aria-hidden="true" />
                <button
                    on:click={clearSearch}
                    class="button is-text is-only-icon"
                    aria-label="Clear search"
                    style="--button-size:1.5rem;">
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </div>
            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Use case</svelte:fragment>
                    {#each [...data.useCases] as useCase}
                        <div class="input-text-wrapper">
                            <input
                                id={`useCase-${useCase}`}
                                type="checkbox"
                                value={$page.url.searchParams.getAll('useCase').includes(useCase)}
                                on:change={(e) => applyFilter('useCase', useCase, e)} />
                            <label for={`useCase-${useCase}`}>{useCase}</label>
                        </div>
                    {/each}
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Runtime</svelte:fragment>
                    {#each [...data.runtimes] as runtime}
                        {@const icon = getIconFromRuntime(runtime)}
                        <div class="u-flex">
                            <input
                                id={`runtime-${runtime}`}
                                type="checkbox"
                                checked={$page.url.searchParams.getAll('runtime').includes(runtime)}
                                on:change={(e) => applyFilter('runtime', runtime, e)} />
                            <div class="avatar is-size-x-small">
                                <img
                                    style:--p-text-size="16px"
                                    src={`${base}/icons/${$app.themeInUse}/color/${icon}.svg`}
                                    alt={icon}
                                    aria-hidden="true"
                                    aria-label={icon} />
                            </div>
                            <label for={`runtime-${runtime}`}>{runtime}</label>
                        </div>
                    {/each}
                </CollapsibleItem>
            </Collapsible>

            <section class="card u-margin-block-start-24">
                <h4 class="body-text-1 u-bold">Contribute</h4>
                <p class="u-margin-block-start-16">
                    Have an idea for a function template? View our <a
                        class="link"
                        href=""
                        target="_blank">contribution guidelines</a
                    >.
                </p>
            </section>
        </section>
        <section>
            <ul
                class="grid-box"
                style="--grid-item-size:22rem; --grid-item-size-small-screens:19rem">
                {#each data.templates as template}
                    <li>
                        <article class="card">
                            <div class="u-flex u-gap-16 u-cross-center">
                                <h2 class="body-text-1 u-bold u-trim">
                                    {template.name}
                                </h2>
                                <ul class="avatars-group is-with-border">
                                    {#each template.runtimes as runtime}
                                        {@const icon = getIconFromRuntime(runtime.name)}
                                        {#if icon}
                                            <li class="avatars-group-item">
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
                                </ul>
                            </div>

                            <p class="u-margin-block-start-20">
                                {template.tagline}
                            </p>

                            <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24">
                                <a
                                    href={`${base}/console/project-${$page.params.project}/functions/templates/template-${template.id}`}
                                    class="button is-text">
                                    <span class="text">View details</span>
                                </a>
                                <button
                                    class="button is-secondary"
                                    on:click={() => connectTemplate(template)}>
                                    <span class="text">Create function</span>
                                </button>
                            </div>
                        </article>
                    </li>
                {/each}
            </ul>
        </section>
    </div>
    <div class="u-flex u-margin-block-start-32 u-flex-wrap">
        <div class="u-margin-inline-start-auto">
            <Pagination limit={data.limit} offset={data.offset} sum={data.sum} />
        </div>
    </div>
</Container>
