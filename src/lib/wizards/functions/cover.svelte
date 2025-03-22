<script context="module" lang="ts">
    import CreateTemplate from './createTemplate.svelte';

    export function connectTemplate(
        template: Models.TemplateFunction,
        runtime: string | null = null
    ) {
        const variables: Record<string, string> = {};
        template.variables.forEach((variable) => {
            variables[variable.name] = variable.value ?? '';
        });

        templateStore.set(template);
        templateConfig.set({
            $id: null,
            runtime,
            name: template.name,
            variables,
            repositoryBehaviour: 'new',
            repositoryName: template.id,
            repositoryPrivate: true,
            repositoryId: null,
            specification: null
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
    import { Button } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import { baseRuntimesList } from '$lib/stores/runtimes';
    import { trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import WizardCover from '$lib/layout/wizardCover.svelte';
    import Repositories from './components/repositories.svelte';
    import CreateManual from './createManual.svelte';
    import CreateGit from './createGit.svelte';
    import { tooltip } from '$lib/actions/tooltip';
    import { isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';
    import { featuredTemplatesList, starterTemplate } from '$lib/stores/templates';

    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    let hasInstallations: boolean;
    let selectedRepository: string;

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
        <div class="git-container u-position-relative">
            <div class="grid-1-1 u-gap-24">
                <div class="card u-cross-child-start u-height-100-percent">
                    <Heading size="6" tag="h6">Connect Git repository</Heading>
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
                    {#if isSelfHosted && !isVcsEnabled}
                        <div
                            class="overlay u-flex-vertical u-position-absolute u-height-100-percent u-width-full-line u-z-index-1 u-text-center u-inset-0"
                            style="border-radius: var(--border-radius-medium)">
                            <div
                                class="u-flex-vertical u-height-100-percent u-main-center u-cross-center u-gap-16 u-padding-inline-24">
                                <Heading size="7" tag="h6" trimmed={false}>
                                    Connect your self-hosted instance to Git
                                </Heading>
                                <p>
                                    Configure your self-hosted instance to connect your function to
                                    a Git repository.
                                    <a
                                        href="https://appwrite.io/docs/advanced/self-hosting/functions#git"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="link">Learn more</a
                                    >.
                                </p>
                            </div>
                        </div>
                    {/if}
                </div>

                <div class="card u-height-100-percent">
                    <section class="common-section">
                        <Heading size="6" tag="h6">Quick start</Heading>
                        <p class="u-margin-block-start-8">Use a starter template.</p>
                        <ul
                            class="grid-box u-margin-block-start-16"
                            style:--grid-item-size="8rem"
                            style:--grid-item-size-small-screens="9rem"
                            style:--grid-gap=".5rem">
                            {#await Promise.all([$baseRuntimesList, $starterTemplate])}
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
                            {:then [response, quickStart]}
                                {@const runtimes = new Map(
                                    response.runtimes.map((r) => [r.$id, r])
                                )}
                                {@const templates = quickStart.runtimes.filter((template) =>
                                    runtimes.has(template.name)
                                )}
                                {#each templates.slice(0, 6) as template}
                                    {@const runtimeDetail = runtimes.get(template.name)}
                                    <li>
                                        <button
                                            on:click={() => {
                                                trackEvent('click_connect_template', {
                                                    from: 'cover',
                                                    template: quickStart.id,
                                                    runtime: template.name
                                                });
                                            }}
                                            on:click={() =>
                                                connectTemplate(quickStart, template.name)}
                                            class="box u-width-full-line u-flex u-cross-center u-gap-8"
                                            style:--box-padding="1rem"
                                            style:--box-border-radius="var(--border-radius-small)">
                                            <div class="avatar is-size-small">
                                                <img
                                                    style:--p-text-size="1.25rem"
                                                    src={`${base}/icons/${$app.themeInUse}/color/${
                                                        template.name.split('-')[0]
                                                    }.svg`}
                                                    alt={template.name} />
                                            </div>
                                            <div class="body-text-2">
                                                {runtimeDetail.name}
                                                <!--{#if runtimeDetail.name.toLowerCase() === 'deno'}-->
                                                <!--    <span class="inline-tag">New</span>-->
                                                <!--{/if}-->
                                            </div>
                                        </button>
                                    </li>
                                {/each}

                                {#if templates.length < 6}
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

                    <Button
                        text
                        class="u-margin-block-start-24 u-margin-inline-start-auto"
                        href={`${base}/project-${$page.params.region}-${$page.params.project}/functions/templates?useCase=starter`}>
                        All starter templates <span class="icon-cheveron-right" />
                    </Button>
                    <div class="u-sep-block-start common-section" />
                    <section class="common-section">
                        <Heading size="6" tag="h6">Templates</Heading>
                        <p class="text u-margin-block-start-8">
                            Find the right template for your use case.
                        </p>

                        <ul class="clickable-list u-margin-block-start-16">
                            {#await $featuredTemplatesList}
                                {#each Array(3) as _i}
                                    <li>
                                        <button
                                            disabled
                                            class="clickable-list-button u-width-full-line u-flex u-gap-12">
                                            <div class="avatar is-size-small">
                                                <div class="loader" />
                                            </div>
                                            <div class="u-flex u-flex-vertical u-gap-4">
                                                <div class="body-text-2 u-bold u-trim">
                                                    <div class="loader" />
                                                </div>
                                                <div class="u-trim-1 u-color-text-gray">
                                                    <div class="loader" />
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                {/each}
                            {:then templatesListWithoutStarter}
                                {#each templatesListWithoutStarter.templates as template}
                                    <li class="clickable-list-item u-padding-block-8">
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
                                            <div
                                                class="avatar is-size-small"
                                                style:--p-text-size="1.25rem">
                                                <span class={template.icon} />
                                            </div>
                                            <div class="u-flex u-flex-vertical u-gap-4">
                                                <div class="body-text-2 u-bold u-trim">
                                                    {template.name}
                                                </div>
                                                <div class="u-trim-1 u-color-text-gray">
                                                    {template.tagline}
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                {/each}
                            {/await}
                        </ul>
                    </section>
                    <Button
                        text
                        noMargin
                        class="u-margin-inline-start-auto u-margin-block-start-16"
                        href={`${base}/project-${$page.params.region}-${$page.params.project}/functions/templates`}>
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
                    href="https://appwrite.io/docs/products/functions/deployment"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="link">Learn more</a
                >.
            </p>
        </div>
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

    .u-sep-block-start {
        border-block-start: solid 0.0625rem hsl(var(--color-neutral)) !important;
    }

    .clickable-list-item:not(:last-child) {
        border-block-end: solid 0.0625rem hsl(var(--color-neutral)) !important;
    }

    :global(.theme-light) {
        --color-neutral: var(--color-neutral-10);
    }

    :global(.theme-dark) {
        --color-neutral: var(--color-neutral-85);
    }

    .inline-tag {
        line-height: 140%;
        font-weight: 500;
    }
</style>
