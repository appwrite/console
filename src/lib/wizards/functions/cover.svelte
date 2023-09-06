<script context="module" lang="ts">
    import CreateTemplate from './createTemplate.svelte';

    export function connectTemplate(template: MarketplaceTemplate, runtime: string | null = null) {
        const variables: Record<string, string> = {};
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
    import { AvatarGroup, Box, Heading } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { repository, templateConfig, template as templateStore } from './store';
    import { marketplace, type MarketplaceTemplate } from '$lib/stores/marketplace';
    import { Button } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import { runtimesList } from '$routes/console/project-[project]/functions/store';
    import { trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import WizardCover from '$lib/layout/wizardCover.svelte';
    import Repositories from './components/repositories.svelte';
    import CreateManual from './createManual.svelte';
    import CreateGit from './createGit.svelte';
    import { tooltip } from '$lib/actions/tooltip';

    let hasInstallations: boolean;
    let selectedRepository: string;

    const quickStart = marketplace.find((template) => template.id === 'starter');
    const templates = marketplace.filter((template) => template.id !== 'starter').slice(0, 2);

    function connect(event: CustomEvent<Models.ProviderRepository>) {
        trackEvent('click_connect_repository', {
            from: 'cover'
        });
        repository.set(event.detail);
        wizard.start(CreateGit);
    }
</script>

<WizardCover>
    <svelte:fragment slot="title">Create Function</svelte:fragment>
    <div class="wizard-container container">
        <div class="grid-1-1 u-gap-24">
            <div>
                <div class="card u-cross-child-start u-height-100-percent">
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
            </div>
            <div class="card u-height-100-percent">
                <section class="common-section">
                    <h2 class="heading-level-6">Quick start</h2>
                    <p class="u-margin-block-start-8">Use a starter template.</p>
                    <ul
                        class="grid-box u-margin-block-start-16"
                        style:--grid-item-size="8rem"
                        style:--grid-item-size-small-screens="9rem"
                        style:--grid-gap=".5rem">
                        {#await $runtimesList}
                            {#each Array(6) as _i}
                                <li>
                                    <button
                                        disabled
                                        class="box u-width-full-line u-flex u-cross-center u-main-center"
                                        style:--box-padding="1rem"
                                        style:--box-border-radius="var(--border-radius-small)">
                                        <div class="avatar is-size-small">
                                            <div class="loader u-margin-16" />
                                        </div>
                                    </button>
                                </li>
                            {/each}
                        {:then response}
                            {@const runtimes = response.runtimes}
                            {#each quickStart.runtimes.filter((_template, index) => index < 6) as runtime}
                                {@const runtimeDetail = runtimes.find(
                                    (r) => r.$id === runtime.name
                                )}
                                <li>
                                    <button
                                        on:click={() => {
                                            trackEvent('click_connect_template', {
                                                from: 'cover',
                                                template: quickStart.id,
                                                runtime: runtime.name
                                            });
                                        }}
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
                                <li
                                    use:tooltip={{
                                        content: 'More runtimes coming soon'
                                    }}>
                                    <Box
                                        class="u-width-full-line u-flex u-cross-center u-gap-8"
                                        padding={16}
                                        radius="small">
                                        <AvatarGroup
                                            icons={['dotnet', 'deno']}
                                            total={4}
                                            avatarSize="small"
                                            color="u-color-text-gray"
                                            bordered />
                                    </Box>
                                </li>
                            {/if}
                        {/await}
                    </ul>
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
                                    on:click={() => {
                                        trackEvent('click_connect_template', {
                                            from: 'cover',
                                            template: template.id
                                        });
                                    }}
                                    on:click={() => connectTemplate(template)}
                                    class="clickable-list-button u-width-full-line u-flex u-gap-12">
                                    <div class="avatar is-size-small" style:--p-text-size="1.25rem">
                                        <span class={template.icon} />
                                    </div>
                                    <div class="u-flex u-flex-vertical u-gap-4">
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
                    noMargin
                    class="u-margin-inline-start-auto u-margin-block-start-16"
                    href={`${base}/console/project-${$page.params.project}/functions/templates`}>
                    <span> All templates </span>
                    <span class="icon-cheveron-right" aria-hidden="true" />
                </Button>
            </div>
        </div>
        <p class="u-margin-block-start-16">
            You can also create a function <button
                class="link"
                on:click={() => {
                    trackEvent('click_create_function_manual', {
                        from: 'cover'
                    });
                }}
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
</WizardCover>
