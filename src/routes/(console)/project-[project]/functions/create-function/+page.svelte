<script lang="ts">
    import { base } from '$app/paths';
    import { AvatarGroup, SvgIcon } from '$lib/components';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import { isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';
    import { afterNavigate, goto } from '$app/navigation';
    import { installation, repository } from '$lib/stores/vcs';
    import { Repositories } from '$lib/components/git';
    import {
        Avatar,
        Card,
        Divider,
        Icon,
        Layout,
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
        .slice(0, 4);

    const starterTemplate = data.templatesList.templates.find(
        (template) => template.id === 'starter'
    );

    const baseRuntimesList = [
        ...new Map(
            data.runtimesList.runtimes.map((runtime) => {
                const base = runtime.name.split('-')[0];
                return [base, runtime];
            })
        ).values()
    ];

    const starterTemplateRuntimes = starterTemplate.runtimes.filter((r) =>
        baseRuntimesList.some((base) => base.$id === r.name)
    );

    function connect(e: CustomEvent<Models.ProviderRepository>) {
        trackEvent('click_connect_repository', { from: 'cover' });
        repository.set(e.detail);
        goto(
            `${wizardBase}/create-function/repository-${e.detail.id}?installation=${$installation.$id}`
        );
    }

    $: console.log(data);
</script>

<Wizard title="Create function" href={previousPage} column>
    <div class="git-container u-position-relative">
        <Layout.Stack>
            <!-- TODO: fix mobile -->
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
                        {#if hasInstallations}
                            <Layout.Stack gap="l">
                                <Divider />
                                <Link variant="quiet" href="#/">
                                    <Layout.Stack direction="row" gap="xs">
                                        Missing a repository? check your permissions <Icon
                                            icon={IconArrowSmRight} />
                                    </Layout.Stack>
                                </Link>
                            </Layout.Stack>
                        {/if}
                    </Layout.Stack>
                </Card.Base>

                <Card.Base>
                    <Layout.Stack gap="xl">
                        <Typography.Title size="s">Quick start</Typography.Title>
                        <Layout.Grid columnsXXS={1} columnsXS={2} columnsS={3} columns={4}>
                            {#each starterTemplateRuntimes.slice(0, 6) as template}
                                {@const iconName = template.name.split('-')[0]}
                                {@const runtimeDetail = baseRuntimesList.find(
                                    (runtime) => runtime.$id === template.name
                                )}
                                <Card.Link
                                    variant="secondary"
                                    radius="s"
                                    padding="s"
                                    on:click={() => {
                                        trackEvent('click_connect_template', {
                                            from: 'cover',
                                            template: starterTemplate.id,
                                            runtime: template.name
                                        });
                                    }}
                                    href={`${wizardBase}/create-function/template-${starterTemplate.id}`}>
                                    <Layout.Stack direction="row" gap="s" alignItems="center">
                                        <Avatar
                                            size="xs"
                                            alt={template.name}
                                            empty={!template.name}>
                                            <SvgIcon name={iconName} iconSize="small" />
                                        </Avatar>
                                        <Typography.Text>
                                            {runtimeDetail?.name}
                                            {#if runtimeDetail?.name?.toLowerCase() === 'deno'}
                                                <span class="inline-tag">New</span>
                                            {/if}
                                        </Typography.Text>
                                    </Layout.Stack>
                                </Card.Link>
                            {/each}

                            {#if starterTemplateRuntimes.length < 6}
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
                        </Layout.Grid>

                        <Divider />

                        <Layout.Grid columnsS={1} columns={2}>
                            {#each featuredTemplatesList as template}
                                <Card.Link
                                    href={`${wizardBase}/create-function/template-${template.id}`}
                                    on:click={() => {
                                        trackEvent('click_connect_template', {
                                            from: 'cover',
                                            template: template.name
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
                        </Layout.Grid>

                        <Link variant="quiet" href="#/">
                            <Layout.Stack direction="row" gap="xs">
                                Browse all templates <Icon icon={IconArrowSmRight} />
                            </Layout.Stack>
                        </Link>
                    </Layout.Stack>
                </Card.Base>
            </Layout.GridFraction>

            <span>
                You can also create a function <Link
                    on:click={() => {
                        trackEvent('click_create_function_manual', { from: 'cover' });
                    }}
                    href={`${wizardBase}/create-function/manual`}>manually</Link>
                or using the CLI.
                <Link href="https://appwrite.io/docs/products/functions/deployment" external
                    >Learn more</Link
                >.
            </span>
        </Layout.Stack>
    </div>

    <!-- TODO: fix overlay -->
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
