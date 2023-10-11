<script lang="ts">
    import { Alert, Card, Collapsible, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { isSelfHosted } from '$lib/system';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import { connectTemplate } from '$lib/wizards/functions/cover.svelte';
    import { consoleVariables } from '$routes/console/store';
    import { template } from './store';
    import { app } from '$lib/stores/app';

    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
</script>

<Container>
    <div class="grid-300px-1fr">
        <section>
            <Collapsible>
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
                        <img
                            class="u-margin-block-start-8"
                            src={$app.themeInUse == 'dark' ? AppwriteLogoDark : AppwriteLogoLight}
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
                {#if isSelfHosted && !isVcsEnabled}
                    <Alert class="u-margin-block-start-24" type="info">
                        <svelte:fragment slot="title">
                            Cloning templates to a self-hosted instance
                        </svelte:fragment>
                        In order to clone a template to a locally hosted Appwrite project, you must set
                        up a Git integration and configure your environment variables.
                        <svelte:fragment slot="buttons">
                            <Button
                                href="https://appwrite.io/docs/advanced/self-hosting/functions"
                                external
                                text>
                                Learn more
                            </Button>
                        </svelte:fragment>
                    </Alert>
                {/if}
                <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24 u-flex-wrap">
                    <Button
                        text
                        href={`https://github.com/${$template.providerOwner}/${$template.providerRepositoryId}`}
                        external>
                        View source
                        <span class="icon-external-link" />
                    </Button>
                    <Button
                        disabled={isSelfHosted && !isVcsEnabled}
                        on:click={() => connectTemplate($template)}>
                        Create function
                    </Button>
                </div>
            </Card>
        </section>
    </div>
</Container>
