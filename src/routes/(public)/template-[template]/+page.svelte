<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { SvgIcon } from '$lib/components/index.js';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { getFrameworkIcon } from '$lib/stores/sites.js';
    import { OAuthProvider, Query, type Models } from '@appwrite.io/console';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Card, Divider, Icon, Image, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let data;

    let projects: Models.ProjectList;
    let selectedProject: string;
    let selectedOrg = data?.organizations?.total ? data.organizations.teams[0].$id : undefined;

    function isSiteTemplate(
        template: Models.TemplateFunction | Models.TemplateSite,
        product: 'site' | 'function'
    ): template is Models.TemplateSite {
        return product === 'site';
    }

    function onGithubLogin() {
        sdk.forConsole.account.createOAuth2Session(
            OAuthProvider.Github,
            window.location.origin,
            window.location.origin,
            ['read:user', 'user:email']
        );
    }

    async function fetchProjects() {
        projects = await sdk.forConsole.projects.list([
            Query.equal('teamId', selectedOrg),
            Query.orderDesc('')
        ]);
        selectedProject = projects.projects[0].$id;
    }

    function generateUrl() {
        if (isSiteTemplate(data.template, data.product)) {
            return `${base}/project-${selectedProject}/sites/create-site/templates/template-${data.template.key}`;
        } else {
            return `${base}/project-${selectedProject}/functions/create-function/templates/template-${data.template.name}`;
        }
    }

    async function handleSubmit() {
        if (selectedProject !== null) {
            await goto(
                `${base}/template-${$page.params.template}/redirect-${selectedOrg}?route=${generateUrl()}`
            );
        }
    }

    $: if (selectedOrg !== undefined) {
        fetchProjects();
    }
</script>

<svelte:head>
    <title>Deploy {data.template.name} - Appwrite</title>
</svelte:head>

<div style:max-width="592px" style:width="100%">
    <Card.Base padding="s" radius="l">
        <Layout.Stack gap="xl">
            <Layout.Stack gap="l">
                <Typography.Title size="l">
                    Deploy {data.product}
                </Typography.Title>
                <Card.Base variant="secondary" padding="xxxs" radius="s">
                    <Layout.GridFraction start={4} end={5}>
                        {#if isSiteTemplate(data.template, data.product)}
                            {@const framework = data.template.frameworks[0]}
                            <Image
                                border
                                radius="s"
                                ratio="16/9"
                                style=" align-self: start"
                                src={$app.themeInUse === 'dark'
                                    ? data.template.screenshotDark ||
                                      `${base}/images/sites/screenshot-placeholder-dark.svg`
                                    : data.template.screenshotLight ||
                                      `${base}/images/sites/screenshot-placeholder-light.svg`}
                                alt="Screenshot" />
                            <Layout.Stack gap="xl">
                                <Layout.Stack gap="xxs">
                                    <Typography.Text
                                        variant="m-500"
                                        color="--fgcolor-neutral-primary">
                                        {data.template.name}
                                    </Typography.Text>
                                    <Typography.Text variant="m-500">
                                        {data.template.tagline}
                                    </Typography.Text>
                                </Layout.Stack>
                                {@const frameworkIcon = getFrameworkIcon(framework.key)}
                                <Layout.Stack gap="xxs" alignItems="center" direction="row">
                                    {#if frameworkIcon}
                                        <SvgIcon iconSize="small" size={16} name={frameworkIcon} />
                                    {/if}
                                    <Typography.Text
                                        variant="m-500"
                                        color="--fgcolor-neutral-primary">
                                        {framework.name}
                                    </Typography.Text>
                                </Layout.Stack>
                            </Layout.Stack>
                        {/if}
                    </Layout.GridFraction>
                </Card.Base>

                {#if data.account}
                    <Form onSubmit={handleSubmit}>
                        <Layout.Stack gap="xl">
                            <InputSelect
                                id="organization"
                                label="Organization"
                                required
                                placeholder="Select an organization"
                                options={data.organizations.teams.map((o) => ({
                                    label: o.name,
                                    value: o.$id
                                }))}
                                bind:value={selectedOrg} />

                            {#key selectedOrg}
                                {#if projects?.total}
                                    <InputSelect
                                        id="project"
                                        label="Project"
                                        required
                                        options={projects.projects.map((p) => ({
                                            label: p.name,
                                            value: p.$id
                                        }))}
                                        bind:value={selectedProject} />
                                {/if}
                            {/key}
                            <Divider />
                            <Layout.Stack direction="row-reverse">
                                {#if selectedProject !== null}
                                    <div>
                                        <Button disabled={!selectedOrg || !selectedProject} submit>
                                            <span class="text">Continue</span>
                                        </Button>
                                    </div>
                                {/if}
                            </Layout.Stack>
                        </Layout.Stack>
                    </Form>
                {:else}
                    <Typography.Text variant="m-500">
                        Sign in to deploy a site from GitHub.
                    </Typography.Text>

                    <Divider />
                    <Button secondary fullWidth on:click={onGithubLogin}>
                        <Icon slot="start" icon={IconGithub} />
                        <span class="text">Sign in with GitHub</span>
                    </Button>
                {/if}
            </Layout.Stack>
        </Layout.Stack>
    </Card.Base>
</div>
