<script lang="ts">
    import { base } from '$app/paths';
    import { SvgIcon } from '$lib/components';
    import { page } from '$app/state';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import { isSelfHosted } from '$lib/system';
    import { consoleVariables } from '$routes/(console)/store';
    import { afterNavigate, goto } from '$app/navigation';
    import { installation, repository } from '$lib/stores/vcs';
    import { Repositories } from '$lib/components/git';
    import {
        Alert,
        Avatar,
        Card,
        Divider,
        Icon,
        Layout,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';

    export let data;

    const isVcsEnabled = $consoleVariables?._APP_VCS_ENABLED === true;
    const wizardBase = `${base}/project-${page.params.region}-${page.params.project}/functions`;
    let previousPage: string = wizardBase;
    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    let selectedRepository: string;

    const featuredTemplates = data.templates
        .filter((template) => template.id !== 'starter')
        .slice(0, 4);

    const starterTemplate = data.templates.find((template) => template.id === 'starter');

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

    function connect(e: Models.ProviderRepository) {
        trackEvent(Click.ConnectRepositoryClick, { from: 'cover' });
        repository.set(e);
        goto(`${wizardBase}/create-function/repository-${e.id}?installation=${$installation.$id}`);
    }
</script>

<Wizard title="Create function" href={previousPage} column columnSize="l" hideFooter>
    <Layout.Stack gap="l">
        <Layout.GridFraction start={4} end={6} gap="l" rowSize="auto">
            <Card.Base>
                {#if isSelfHosted && !isVcsEnabled}
                    <Layout.Stack gap="xl">
                        <Typography.Title size="s">Connect Git repository</Typography.Title>

                        <Alert.Inline
                            status="info"
                            title="Connect your self-hosted instance to Git ">
                            <Layout.Stack>
                                <p>
                                    Configure your self-hosted instance to connect your function to
                                    a Git repository.
                                </p>
                                <div>
                                    <Button
                                        compact
                                        external
                                        href="https://appwrite.io/docs/advanced/self-hosting/functions#git"
                                        >Learn more</Button>
                                </div>
                            </Layout.Stack>
                        </Alert.Inline>
                    </Layout.Stack>
                {:else}
                    <Layout.Stack
                        gap="xl"
                        justifyContent="space-between"
                        alignContent="space-between"
                        alignItems="stretch"
                        height="100%">
                        <Layout.Stack gap="xl">
                            <Typography.Title size="s">Connect Git repository</Typography.Title>

                            <Repositories
                                bind:selectedRepository
                                action="button"
                                callbackState={{
                                    from: 'github',
                                    to: 'cover'
                                }}
                                {connect} />
                        </Layout.Stack>
                        {#if data.installations.total}
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
                {/if}
            </Card.Base>

            <Card.Base>
                <Layout.Stack gap="xl">
                    <Typography.Title size="s">Quick start</Typography.Title>
                    <Layout.Grid columnsXXS={1} columnsXS={2} columnsS={3} columns={4} gap="s">
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
                                href={`${wizardBase}/create-function/template-${starterTemplate.id}?runtime=${runtimeDetail.$id}`}>
                                <Layout.Stack direction="row" gap="s" alignItems="center">
                                    <Avatar size="xs" alt={template.name} empty={!template.name}>
                                        <SvgIcon name={iconName} iconSize="small" />
                                    </Avatar>
                                    <Typography.Text color="--fgcolor-neutral-primary">
                                        <Layout.Stack direction="row" gap="xs" alignItems="center">
                                            {runtimeDetail?.name}
                                            <!--{#if runtimeDetail?.name?.toLowerCase() === 'deno'}-->
                                            <!--    <Badge-->
                                            <!--        variant="secondary"-->
                                            <!--        size="xs"-->
                                            <!--        content="New" />-->
                                            <!--{/if}-->
                                        </Layout.Stack>
                                    </Typography.Text>
                                </Layout.Stack>
                            </Card.Link>
                        {/each}
                    </Layout.Grid>

                    <Divider />

                    <Layout.Grid columnsS={1} columns={2}>
                        {#each featuredTemplates as template}
                            <Card.Link
                                radius="s"
                                padding="xs"
                                href={`${wizardBase}/create-function/template-${template.id}`}
                                on:click={() => {
                                    trackEvent('click_connect_template', {
                                        from: 'cover',
                                        template: template.name
                                    });
                                }}>
                                <Layout.Stack gap="xxs">
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
                                        <Icon
                                            icon={IconArrowSmRight}
                                            color="--fgcolor-neutral-tertiary" />
                                    </Layout.Stack>
                                    <Typography.Text variant="m-400">
                                        {template.tagline}
                                    </Typography.Text>
                                </Layout.Stack>
                            </Card.Link>
                        {/each}
                    </Layout.Grid>

                    <Link variant="quiet" href={`${wizardBase}/templates`}>
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
</Wizard>
