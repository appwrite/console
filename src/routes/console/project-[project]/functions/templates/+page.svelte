<script lang="ts">
    import { Collapsible, CollapsibleItem } from '$lib/components/index.js';
    import { CARD_LIMIT } from '$lib/constants';
    import { InputCheckbox } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import data from './data.json';

    let search = '';
    let page = 1;

    const filter = {
        runtimes: {},
        useCases: {}
    };

    const [runtimes, useCases] = data.reduce(
        ([rt, uc], next) => {
            next.runtimes.forEach((runtime) => rt.add(runtime.name));
            next.useCases.forEach((useCase) => uc.add(useCase));
            return [rt, uc];
        },
        [new Set<string>(), new Set<string>()]
    );

    $: templates = data
        .filter((template) => {
            const hasRuntime = template.runtimes.some(
                (runtime) => filter.runtimes[runtime.name] ?? false
            );
            if (Object.values(filter.runtimes).some((n) => n) && !hasRuntime) {
                return false;
            }

            const hasUseCase = template.useCases.some(
                (useCase) => filter.useCases[useCase] ?? false
            );
            if (Object.values(filter.useCases).some((n) => n) && !hasUseCase) {
                return false;
            }

            return template.name.toLowerCase().includes(search.toLowerCase());
        })
        .splice((page - 1) * CARD_LIMIT, CARD_LIMIT);

    /**
     * Reset filters on pagination
     */
    $: {
        filter;
        search;
        page = 1;
    }
</script>

<Container>
    <div class="grid-300px-1fr">
        <section>
            <h3 class="body-text-1 u-bold">Filter templates</h3>
            <div
                class="input-text-wrapper is-with-end-button u-width-full-line u-max-width-500 u-margin-block-start-12"
                style="--amount-of-buttons:1">
                <input bind:value={search} type="search" placeholder="Search templates" />
                <div class="icon-search" aria-hidden="true" />
                <button
                    on:click={() => (search = '')}
                    class="button is-text is-only-icon"
                    aria-label="Clear search"
                    style="--button-size:1.5rem;">
                    <span class="icon-x" aria-hidden="true" />
                </button>
            </div>
            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Use case</svelte:fragment>
                    {#each [...useCases] as useCase}
                        <InputCheckbox
                            id={`useCase-${useCase}`}
                            label={useCase}
                            bind:value={filter.useCases[useCase]} />
                    {/each}
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Runtime</svelte:fragment>
                    {#each [...runtimes] as runtime}
                        <InputCheckbox
                            id={`runtime-${runtime}`}
                            label={runtime}
                            bind:value={filter.runtimes[runtime]} />
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
                {#each templates as template}
                    <li>
                        <article class="card">
                            <div class="u-flex u-gap-16">
                                <h2 class="body-text-1 u-bold u-trim">
                                    {template.name}
                                </h2>

                                <ul class="avatars-group is-with-border">
                                    {#each template.runtimes as runtime}
                                        <li class="avatars-group-item">
                                            <div class="avatar is-size-small">
                                                <span
                                                    class={`icon-${runtime.name}`}
                                                    aria-hidden="true"
                                                    aria-label="GitHub" />
                                            </div>
                                        </li>
                                    {/each}
                                </ul>
                            </div>

                            <p class="u-margin-block-start-20">
                                {template.tagline}
                            </p>

                            <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24">
                                <button class="button is-text">
                                    <span class="text">View details</span>
                                </button>
                                <button class="button is-secondary">
                                    <span class="text">Create function</span>
                                </button>
                            </div>
                        </article>
                    </li>
                {/each}
            </ul>
        </section>
    </div>
    <div class="u-flex common-section u-main-space-between">
        <p class="text">Total results: {templates.length}</p>
        <nav class="pagination">
            <button class="button is-text" aria-label="prev page" on:click={() => page--}>
                <span class="icon-cheveron-left" aria-hidden="true" />
                <span class="text">Prev</span>
            </button>
            <ol class="pagination-list is-only-desktop">
                <li class="pagination-item">
                    <button class="button" aria-label="page">
                        <span class="text">1</span>
                    </button>
                </li>
            </ol>
            <button class="button is-text" aria-label="next page" on:click={() => page++}>
                <span class="text">Next</span>
                <span class="icon-cheveron-right" aria-hidden="true" />
            </button>
        </nav>
    </div>
</Container>
