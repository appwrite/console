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
            <h3 class="body-text-1 u-bold">Use cases</h3>
            <div class="u-margin-block-start-8 u-flex u-flex-wrap u-gap-8">
                {#each $template.usecases as useCase}
                    <Pill>{useCase}</Pill>
                {/each}
            </div>
            <h3 class="body-text-1 u-bold u-margin-block-start-8">Runtimes</h3>
            <div class="u-margin-block-start-8 u-flex u-flex-wrap u-gap-8">
                {#each $template.runtimes as runtime}
                    <Pill>{runtime.name}</Pill>
                {/each}
            </div>

            <section class="card u-margin-block-start-24">
                <h4 class="body-text-1 u-bold">Published by</h4>
                {$template.providerOwner}
            </section>
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
