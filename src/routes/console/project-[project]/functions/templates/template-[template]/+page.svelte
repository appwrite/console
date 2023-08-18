<script lang="ts">
    import { Card, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { connectTemplate } from '$lib/wizards/functions/cover.svelte';
    import { template } from './store';
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
            <Card>{$template.instructions}</Card>
        </section>
    </div>
</Container>
