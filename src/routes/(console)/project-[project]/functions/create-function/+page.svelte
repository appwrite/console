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
    import { AvatarGroup, SvgIcon } from '$lib/components';
    import { wizard } from '$lib/stores/wizard';
    import { templateConfig, template as templateStore } from './store';
    import { Button } from '$lib/elements/forms';
    import { page } from '$app/stores';
    import { baseRuntimesList } from '$lib/stores/runtimes';
    import { trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import { isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';
    import { afterNavigate, goto } from '$app/navigation';
    import CreateManual from './wizard/createManual.svelte';
    import { installation, repository } from '$lib/stores/vcs';
    import { Repositories } from '$lib/components/git';
    import {
        Avatar,
        Card,
        Divider,
        Icon,
        Layout,
        Skeleton,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight, IconDeno, IconDotnet } from '@appwrite.io/pink-icons-svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { Link } from '$lib/elements';

    export let data;

    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    const wizardBase = `${base}/project-${$page.params.project}/functions`;
    let previousPage: string = wizardBase;
    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    let hasInstallations: boolean;
    let selectedRepository: string;

    const featuredTemplatesList = data.templatesList.templates
        .filter((template) => template.id !== 'starter')
        .slice(0, 2);

    const starterTemplate = data.templatesList.templates.find(
        (template) => template.id === 'starter'
    );

    function connect(e: CustomEvent<Models.ProviderRepository>) {
        trackEvent('click_connect_repository', {
            from: 'cover'
        });
        repository.set(e.detail);
        const target = `${wizardBase}/create-function/repository-${e.detail.id}?installation=${$installation.$id}`;
        goto(target);
    }
</script>

<Wizard title="Create function" href={previousPage} column>
    <div class="git-container u-position-relative">
        <Layout.GridFraction start={4} end={6} gap="l">
            <Card.Base>
                <Layout.Stack
                    gap="xl"
                    justifyContent="space-between"
                    alignContent="space-between"
                    alignItems="stretch"
                    height="100%">
                    <Layout.Stack gap="xl">
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
                    <Layout.Stack gap="l">
                        <Divider />
                        <Link variant="quiet" href="#/">
                            <Layout.Stack direction="row" gap="xs">
                                Missing a repository? check your permissions <Icon
                                    icon={IconArrowSmRight} />
                            </Layout.Stack>
                        </Link>
                    </Layout.Stack>
                </Layout.Stack>
            </Card.Base>

            <Card.Base>
                <Layout.Stack gap="xl">
                    <Typography.Title size="s">Quick start</Typography.Title>
                    <Layout.Grid columns={4}>
                        {#await Promise.all([$baseRuntimesList, starterTemplate])}
                            {#each Array(6) as _i}
                                <Card.Button padding="s" radius="s">
                                    <Layout.Stack direction="row" gap="s" alignItems="center">
                                        <Skeleton variant="circle" width={24} height={24} />
                                        <Skeleton variant="line" width="100%" height={22} />
                                    </Layout.Stack>
                                </Card.Button>
                            {/each}
                        {:then [response, quickStart]}
                            {@const runtimes = new Map(response.runtimes.map((r) => [r.$id, r]))}
                            {@const templates = quickStart.runtimes.filter((template) =>
                                runtimes.has(template.name)
                            )}
                            {#each templates.slice(0, 6) as template}
                                {@const runtimeDetail = runtimes.get(template.name)}
                                {@const iconName = template.name.split('-')[0]}
                                <Card.Button
                                    variant="secondary"
                                    radius="s"
                                    padding="s"
                                    on:click={() => {
                                        trackEvent('click_connect_template', {
                                            from: 'cover',
                                            template: quickStart.id,
                                            runtime: template.name
                                        });
                                    }}
                                    on:click={() => connectTemplate(quickStart, template.name)}>
                                    <Layout.Stack direction="row" gap="s" alignItems="center">
                                        <Avatar
                                            size="xs"
                                            alt={template.name}
                                            empty={!template.name}>
                                            <SvgIcon name={iconName} iconSize="small" />
                                        </Avatar>
                                        <Typography.Text>
                                            {runtimeDetail.name}
                                            {#if runtimeDetail.name.toLowerCase() === 'deno'}
                                                <span class="inline-tag">New</span>
                                            {/if}
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Card.Button>
                            {/each}

                            {#if templates.length < 6}
                                <Tooltip>
                                    <Card.Base variant="secondary" radius="s" padding="s">
                                        <AvatarGroup
                                            icons={[IconDotnet, IconDeno]}
                                            total={4}
                                            size="xs" />
                                    </Card.Base>
                                    <span slot="tooltip">More runtimes coming soon</span>
                                </Tooltip>
                            {/if}
                        {/await}
                    </Layout.Grid>

                    <Divider />

                    <ul class="clickable-list u-margin-block-start-16">
                        {#each featuredTemplatesList as template}
                            <Card.Link
                                href={`${wizardBase}/create-function/template-${template.id}`}
                                on:click={() => {
                                    trackEvent('click_connect_template', {
                                        from: 'cover',
                                        template: template.id
                                    });
                                }}>
                                <Layout.Stack gap="s">
                                    <Layout.Stack
                                        direction="row"
                                        gap="s"
                                        alignItems="center"
                                        justifyContent="space-between">
                                        <Typography.Text
                                            variant="m-500"
                                            color="--fgcolor-neutral-primary">
                                            {template.name}
                                        </Typography.Text>
                                        <Icon icon={IconArrowSmRight} />
                                    </Layout.Stack>
                                    <Typography.Text variant="m-400">
                                        {template.tagline}
                                    </Typography.Text>
                                </Layout.Stack>
                            </Card.Link>
                        {/each}
                    </ul>
                    <Button
                        text
                        class="u-margin-inline-start-auto u-margin-block-start-16"
                        href={`${base}/project-${$page.params.project}/functions/templates`}>
                        <span> All templates </span>
                        <span class="icon-cheveron-right" aria-hidden="true" />
                    </Button>
                </Layout.Stack>
            </Card.Base>
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
    {#if isSelfHosted && !isVcsEnabled}
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
    {/if}
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
