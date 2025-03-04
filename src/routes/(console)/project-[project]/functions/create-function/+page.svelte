<script context="module" lang="ts">
    import CreateTemplate from './wizard/createTemplate.svelte';

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
            repositoryId: null
        });
        wizard.start(CreateTemplate);
    }
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { AvatarGroup, Box, Card } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { templateConfig, template as templateStore } from './store';
    import { Button } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import { baseRuntimesList } from '$lib/stores/runtimes';
    import { trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import { isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';
    import { featuredTemplatesList, starterTemplate } from '$lib/stores/templates';
    import { afterNavigate, goto } from '$app/navigation';
    import CreateManual from './wizard/createManual.svelte';
    import { installation, repository } from '$lib/stores/vcs';
    import { Repositories } from '$lib/components/git';
    import { Divider, Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight, IconDeno, IconDotnet } from '@appwrite.io/pink-icons-svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { Link } from '$lib/elements';

    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    let hasInstallations: boolean;
    let selectedRepository: string;

    function connect(e: CustomEvent<Models.ProviderRepository>) {
        trackEvent('click_connect_repository', {
            from: 'cover'
        });
        repository.set(e.detail);
        const target = `${base}/project-${$page.params.project}/functions/create-function/repository-${e.detail.id}?installation=${$installation.$id}`;
        goto(target);
    }

    let previousPage: string = base;
    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });
</script>

<Wizard title="Create function" href={previousPage} column>
    <div class="git-container u-position-relative">
        <Layout.GridFraction start={2} end={3} gap="xxl">
            <Card>
                <Layout.Stack
                    gap="xl"
                    justifyContent="space-between"
                    alignContent="space-between"
                    alignItems="stretch"
                    height="100%">
                    <Layout.Stack gap="xl" inline>
                        <Typography.Title size="s">Connect Git repository</Typography.Title>

                        <Repositories
                            bind:hasInstallations
                            bind:selectedRepository
                            action="button"
                            callbackState={{
                                from: 'github',
                                to: 'cover'
                            }}
                            on:connect={connect} />
                    </Layout.Stack>
                    <Layout.Stack gap="l" inline>
                        <Divider />
                        <Link variant="quiet" href="#/">
                            <Layout.Stack direction="row" gap="xs">
                                Missing a repository? check your permissions <Icon
                                    icon={IconArrowSmRight} />
                            </Layout.Stack>
                        </Link>
                    </Layout.Stack>
                </Layout.Stack>
            </Card>

            <div class="card u-height-100-percent">
                <section class="common-section">
                    <Typography.Title size="s">Quick start</Typography.Title>
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
                            {@const runtimes = new Map(response.runtimes.map((r) => [r.$id, r]))}
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
                                        on:click={() => connectTemplate(quickStart, template.name)}
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
                                            {#if runtimeDetail.name.toLowerCase() === 'deno'}
                                                <span class="inline-tag">New</span>
                                            {/if}
                                        </div>
                                    </button>
                                </li>
                            {/each}

                            {#if templates.length < 6}
                                <Tooltip>
                                    <li>
                                        <Box
                                            class="u-width-full-line u-flex u-cross-center u-gap-8"
                                            padding={16}
                                            radius="small">
                                            <AvatarGroup
                                                icons={[IconDotnet, IconDeno]}
                                                total={4}
                                                size="s" />
                                        </Box>
                                    </li>
                                    <span slot="tooltip">More runtimes coming soon</span>
                                </Tooltip>
                            {/if}
                        {/await}
                    </ul>
                </section>

                <Button
                    text
                    class="u-margin-block-start-24 u-margin-inline-start-auto"
                    href={`${base}/project-${$page.params.project}/functions/templates?useCase=starter`}>
                    All starter templates <span class="icon-cheveron-right" />
                </Button>
                <div class="u-sep-block-start common-section" />
                <section class="common-section">
                    <Typography.Title size="s">Templates</Typography.Title>
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
                    class="u-margin-inline-start-auto u-margin-block-start-16"
                    href={`${base}/project-${$page.params.project}/functions/templates`}>
                    <span> All templates </span>
                    <span class="icon-cheveron-right" aria-hidden="true" />
                </Button>
            </div>
        </Layout.GridFraction>

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
    <!-- {#if isSelfHosted && !isVcsEnabled}
        <div
            class="overlay u-flex-vertical u-position-absolute u-height-100-percent u-width-full-line u-z-index-1 u-text-center u-inset-0"
            style="border-radius: var(--border-radius-medium)">
            <div
                class="u-flex-vertical u-height-100-percent u-main-center u-cross-center u-gap-16 u-padding-inline-24">
                <Typography.Title size="s">
                    Connect your self-hosted instance to Git
                </Typography.Title>
                <p>
                    Configure your self-hosted instance to connect your function to a Git
                    repository.
                    <a
                        href="https://appwrite.io/docs/advanced/self-hosting/functions#git"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link">Learn more</a
                    >.
                </p>
            </div>
        </div>
    {/if} -->
</Wizard>

<style lang="scss">
    .git-container .overlay {
        background: linear-gradient(
            0,
            hsl(var(--p-card-bg-color)) 68.91%,
            hsl(var(--p-card-bg-color) / 0.5) 92.8%
        );
    }

    .inline-tag {
        line-height: 140%;
        font-weight: 500;
    }
</style>
