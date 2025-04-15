<script lang="ts">
    import { Card, Collapsible, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container, ContainerButton } from '$lib/layout';
    import { isCloud } from '$lib/system';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import { connectTemplate } from '$lib/wizards/functions/cover.svelte';
    import { template } from './store';
    import { app } from '$lib/stores/app';
    import { isServiceLimited } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { functionsList } from '../../store';
    import { canWriteFunctions } from '$lib/stores/roles';

    $: buttonDisabled =
        isCloud && isServiceLimited('functions', $organization?.billingPlan, $functionsList?.total);
</script>

<Container>
    <div class="grid-300px-1fr">
        <section>
            <Collapsible>
                <li class="collapsible-item-divider collapsible-item">
                    <h3 class="u-flex u-gap-16 body-text-2 u-bold u-padding-block-12">
                        Use cases
                        <span class="inline-tag">{$template.useCases.length}</span>
                    </h3>
                    <div class="collapsible-content u-flex u-flex-wrap u-gap-8">
                        {#each $template.useCases as useCase}
                            <Pill>{useCase}</Pill>
                        {/each}
                    </div>
                </li>
                <li class="collapsible-item-divider collapsible-item">
                    <h3 class="u-flex u-gap-16 body-text-2 u-bold u-padding-block-12">
                        Runtimes
                        <span class="inline-tag">{$template.runtimes.length}</span>
                    </h3>
                    <div class="collapsible-content u-flex u-flex-wrap u-gap-8">
                        {#each $template.runtimes as runtime}
                            <Pill>{runtime.name}</Pill>
                        {/each}
                    </div>
                </li>
                <li class="collapsible-item-divider collapsible-item">
                    <section class="card u-margin-block-start-24">
                        <h4 class="body-text-1 u-bold">Published by</h4>
                        <img
                            class="u-margin-block-start-8"
                            src={$app.themeInUse === 'dark' ? AppwriteLogoDark : AppwriteLogoLight}
                            width="120"
                            height="22"
                            alt="Appwrite" />
                    </section>
                </li>
            </Collapsible>
        </section>
        <section>
            <Card>
                <Heading size="7" tag="h3">
                    <span class="u-flex u-cross-center u-gap-16 functions-avatar-holder">
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

                <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24 u-flex-wrap">
                    <Button
                        text
                        href={`https://github.com/${$template.providerOwner}/${$template.providerRepositoryId}`}
                        external>
                        View source
                        <span class="icon-external-link" />
                    </Button>
                    {#if $canWriteFunctions}
                        <ContainerButton
                            title="functions"
                            disabled={buttonDisabled}
                            buttonMethod={() => connectTemplate($template)}
                            showIcon={false}
                            buttonText="Create function"
                            buttonEvent="create_function" />
                    {/if}
                </div>
            </Card>
        </section>
    </div>
</Container>

<style>
    :global(.theme-dark .collapsible-item-divider:where(:not(:last-child))) {
        border-block-end: solid 0.0625rem hsl(var(--color-neutral-85));
    }

    :global(.theme-light .collapsible-item-divider:where(:not(:last-child))) {
        border-block-end: solid 0.0625rem hsl(var(--color-neutral-10));
    }
</style>
