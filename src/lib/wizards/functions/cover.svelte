<script context="module" lang="ts">
    import CreateTemplate from './createTemplate.svelte';

    export function connectTemplate(template: MarketplaceTemplate, runtime: string | null = null) {
        const variables: any = {};
        template.variables.forEach((variable) => {
            variables[variable.name] = variable.value ?? '';
        });

        if (!runtime) {
            runtime = template.runtimes[0].name;
        }

        templateStore.set(template);
        templateConfig.set({
            $id: null,
            runtime,
            name: template.name,
            variables,
            repositoryBehaviour: 'new',
            repositoryName: template.id,
            repositoryPrivate: true,
            repositoryId: null
        });
        wizard.start(CreateTemplate);
    }
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { AvatarGroup, Heading } from '$lib/components';
    import WizardCover from '$lib/layout/wizardCover.svelte';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { repository, templateConfig, template as templateStore } from './store';
    import { marketplace, type MarketplaceTemplate } from '$lib/stores/marketplace';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import Repositories from './components/repositories.svelte';
    import CreateManual from './createManual.svelte';
    import CreateGit from './createGit.svelte';
    import { Button } from '$lib/elements/forms';
    import { page } from '$app/stores';

    let hasInstallations: boolean;
    let selectedRepository: string;

    const quickStart = marketplace.find((template) => template.id === 'starter');
    const templates = marketplace.filter((template) => template.id !== 'starter').slice(0, 2);

    function connect(event: CustomEvent<Models.ProviderRepository>) {
        repository.set(event.detail);
        wizard.start(CreateGit);
    }

    async function loadRuntimes() {
        let runtimes = await sdk.forProject.functions.listRuntimes();
        return runtimes.runtimes;
    }
</script>

<WizardCover>
    <svelte:fragment slot="title">Create Function</svelte:fragment>
    <div class="wizard-container container">
        <div class="grid-1-1 u-gap-24">
            <div>
                <div class="card u-cross-child-start">
                    <Heading size="6" tag="h2">Connect Git repository</Heading>
                    <p class="u-margin-block-start-8">
                        Create and deploy a function with a connected git repository.
                    </p>
                    <div class="u-margin-block-start-24">
                        <Repositories
                            bind:hasInstallations
                            bind:selectedRepository
                            action="button"
                            callbackState={{
                                from: 'github',
                                to: 'cover'
                            }}
                            on:connect={connect} />
                    </div>
                </div>
                <p class="u-margin-block-start-16">
                    You can also create a function <button
                        class="link"
                        on:click={() => wizard.start(CreateManual)}>manually</button>
                    or using the CLI.
                    <a
                        href="https://appwrite.io/docs/functions-deploy"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link">Learn more</a
                    >.
                </p>
            </div>
            <div class="card">
                <section class="common-section">
                    <h2 class="heading-level-6">Quick start</h2>
                    <p class="u-margin-block-start-8">
                        Use a starter templates to begin with the basics.
                    </p>

                    {#await loadRuntimes()}
                        <div class="avatar is-size-x-small">
                            <div class="loader u-margin-16" />
                        </div>
                    {:then runtimes}
                        <ul
                            class="grid-box u-margin-block-start-16"
                            style:--grid-item-size="8rem"
                            style:--grid-item-size-small-screens="9rem"
                            style:--grid-gap="1rem">
                            {#each quickStart.runtimes.filter((_template, index) => index < 6) as runtime}
                                {@const runtimeDetail = runtimes.find(
                                    (r) => r.$id === runtime.name
                                )}
                                <li>
                                    <button
                                        on:click={() => connectTemplate(quickStart, runtime.name)}
                                        class="box u-width-full-line u-flex u-cross-center u-gap-8"
                                        style:--box-padding="1rem"
                                        style:--box-border-radius="var(--border-radius-small)">
                                        <div class="avatar is-size-small">
                                            <img
                                                style:--p-text-size="1.25rem"
                                                src={`${base}/icons/${$app.themeInUse}/color/${
                                                    runtime.name.split('-')[0]
                                                }.svg`}
                                                alt={runtime.name} />
                                        </div>
                                        <div class="body-text-2">
                                            {runtimeDetail.name}
                                        </div>
                                    </button>
                                </li>
                            {/each}

                            {#if quickStart.runtimes.length < 6}
                                <li>
                                    <div
                                        class="box u-width-full-line u-flex u-cross-center u-gap-8"
                                        style:--box-padding="1rem"
                                        style:--box-border-radius="var(--border-radius-small)">
                                        <AvatarGroup
                                            icons={['dotnet', 'deno']}
                                            total={4}
                                            avatarSize="small"
                                            bordered />
                                    </div>
                                </li>
                            {/if}
                        </ul>
                    {/await}
                </section>
                <div class="u-sep-block-start common-section" />
                <section class="common-section">
                    <h2 class="heading-level-6">Templates</h2>
                    <p class="text u-margin-block-start-8">
                        Find the right template for your use case.
                    </p>

                    <ul class="clickable-list u-margin-block-start-16">
                        {#each templates as template}
                            <li class="clickable-list-item">
                                <button
                                    type="button"
                                    on:click={() => connectTemplate(template)}
                                    class="clickable-list-button u-width-full-line u-flex u-gap-12">
                                    <div class="avatar is-size-small" style:--p-text-size="1.25rem">
                                        <span class={template.icon} />
                                    </div>
                                    <div>
                                        <div class="body-text-2 u-bold u-trim">{template.name}</div>
                                        <div class="u-trim-1 u-color-text-gray">
                                            {template.tagline}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        {/each}
                    </ul>
                </section>
                <Button
                    text
                    class="u-margin-inline-start-auto u-margin-block-start-16"
                    href={`${base}/console/project-${$page.params.project}/functions/templates`}>
                    <span> All templates </span>
                    <span class="icon-cheveron-right" aria-hidden="true" />
                </Button>
            </div>
        </div>
    </div>
</WizardCover>
