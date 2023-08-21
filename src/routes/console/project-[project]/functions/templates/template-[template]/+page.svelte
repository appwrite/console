<script lang="ts">
    import { Card, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { connectTemplate } from '$lib/wizards/functions/cover.svelte';
    import { template } from './store';

    async function fetchReadme() {
        const runtime = $template.runtimes[0];
        const url = `https://api.github.com/repos/${$template.providerOwner}/${$template.providerRepositoryId}/contents/${runtime.providerRootDirectory}/README.md`;
        console.log(url);

        const response = await fetch(url, {
            headers: {
                Accept: 'application/vnd.github.html'
            }
        });
        const readmeHTML = await response.text();
        return readmeHTML;
    }
</script>

<Container>
    <div class="grid-300px-1fr">
        <section>
            <ul class="collapsible">
                <li class="collapsible-item">
                    <h3 class="body-text-2 u-bold u-padding-block-12">
                        Use cases <span class="inline-tag">{$template.usecases.length}</span>
                    </h3>
                    <div class="collapsible-content u-flex u-flex-wrap u-gap-8">
                        {#each $template.usecases as useCase}
                            <Pill>{useCase}</Pill>
                        {/each}
                    </div>
                </li>
                <li class="collapsible-item">
                    <h3 class="body-text-2 u-bold u-padding-block-12">
                        Runtimes <span class="inline-tag">{$template.runtimes.length}</span>
                    </h3>
                    <div class="collapsible-content u-flex u-flex-wrap u-gap-8">
                        {#each $template.runtimes as runtime}
                            <Pill>{runtime.name}</Pill>
                        {/each}
                    </div>
                </li>
                <li class="collapsible-item">
                    <section class="card u-margin-block-start-24">
                        <h4 class="body-text-1 u-bold">Published by</h4>
                        {$template.providerOwner}
                    </section>
                </li>
            </ul>
        </section>
        <section>
            <Card>
                <Heading size="7" tag="h3">
                    <span class="u-flex u-cross-center u-gap-8">
                        <div class="avatar is-size-small">
                            <span
                                style:--p-text-size="20px"
                                class={$template.icon}
                                aria-hidden="true" />
                        </div>
                        {$template.name}
                    </span>
                </Heading>
                <p class="u-margin-block-start-24">{$template.tagline}</p>
                <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24">
                    <Button
                        text
                        href={`https://github.com/${$template.providerOwner}/${$template.providerRepositoryId}`}
                        external>
                        View source
                        <span class="icon-external-link" />
                    </Button>
                    <Button secondary on:click={() => connectTemplate($template)}>
                        Create function
                    </Button>
                </div>
            </Card>
            <Card>{@html $template.instructions}</Card>
            {#await fetchReadme() then readmeHTML}
                <Card>
                    {@html readmeHTML}
                </Card>
            {/await}
        </section>
    </div>
</Container>

<style lang="scss">
    /* svelte-ignore css-unused-selector */
    :global(.md) {
        @import './node_modules/@appwrite.io/pink/src/_index.scss';
        :global(.anchor) {
            display: none;
        }
        :global(h1) {
            @extend .heading-level-4;
            @extend .common-section;
        }
        :global(h2) {
            @extend .u-margin-block-start-16;
            @extend .heading-level-5;
        }
        :global(h3) {
            @extend .u-margin-block-start-16;
            @extend .heading-level-6;
        }
        :global(p) {
            @extend .u-margin-block-start-8;
        }
        :global(strong) {
            @extend .u-bold;
        }
        :global(p),
        :global(h1),
        :global(h2),
        :global(h3),
        :global(td) {
            :global(code) {
                @extend .inline-code;
            }
        }
        :global(.snippet-clipboard-content) {
            @extend .box;
            @extend .u-margin-block-start-8;
        }

        :global(.highlight) {
            @extend .box;
            @extend .u-margin-block-start-8;
        }

        > :global(table) {
            outline: 2px solid red;
            @extend .table;
        }
    }

    /* svelte-ignore css-unused-selector */
    :global(.theme-dark) {
        :global(.inline-code) {
            --p-bg-color-inline-code: red;
            --p-text-color-inline-code: var(--color-neutral-30);
        }
        :global(.highlight),
        :global(.snippet-clipboard-content) {
            --p-box-text-color: var(--color-neutral-5);
            --p-box-background-color-default: var(--color-neutral-200);
            --p-box-background-color-hover: var(--color-neutral-150);
            --p-box-border-color: var(--color-neutral-150);
        }
    }
</style>
