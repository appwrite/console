<script lang="ts">
    import { base } from '$app/paths';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import CustomId from '$lib/components/customId.svelte';
    import { SvgIcon } from '$lib/components/index.js';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import { getFlagUrl } from '$lib/helpers/flag.js';
    import type { AllowedRegions } from '$lib/sdk/billing.js';
    import { app } from '$lib/stores/app';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { getFrameworkIcon } from '$lib/stores/sites.js';
    import { isCloud } from '$lib/system';
    import { ID, OAuthProvider, Query, type Models, Region } from '@appwrite.io/console';
    import { IconGithub, IconPencil, IconPlusSm } from '@appwrite.io/pink-icons-svelte';
    import {
        Card,
        Divider,
        Icon,
        Image,
        Input,
        Layout,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';

    let { data } = $props();

    let projects = $state<Models.ProjectList>();
    let selectedProject = $state<string>();
    let selectedOrg = $state(
        data?.organizations?.total ? data.organizations.teams[0].$id : undefined
    );
    let projectName = $state<string>();
    let showCustomId = $state(false);
    let region = $state<AllowedRegions>();
    let regions = $state<Array<Models.ConsoleRegion>>([]);
    let id = $state<string>();

    function getRegions() {
        return regions
            .filter((region) => region.$id !== 'default')
            .sort((regionA, regionB) => {
                if (regionA.disabled && !regionB.disabled) {
                    return 1;
                }
                return regionA.name > regionB.name ? 1 : -1;
            })
            .map((region) => {
                return {
                    label: region.name,
                    value: region.$id,
                    leadingHtml: `<img src='${getFlagUrl(region.flag)}' alt='Region flag'/>`,
                    disabled: region.disabled
                };
            });
    }

    function isSiteTemplate(
        template: Models.TemplateFunction | Models.TemplateSite,
        product: 'site' | 'function'
    ): template is Models.TemplateSite {
        return product === 'site' && 'frameworks' in template;
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
        selectedProject = projects?.total ? projects.projects[0].$id : null;
    }

    function generateUrl() {
        if (isSiteTemplate(data.template, data.product)) {
            return `${base}/project-${selectedProject}/sites/create-site/templates/template-${data.template.key}`;
        } else {
            return `${base}/project-${selectedProject}/functions/create-function/templates/template-${data.template.name}`;
        }
    }

    async function handleSubmit() {
        if (selectedProject === null) {
            try {
                const p = await sdk.forConsole.projects.create(
                    id ?? ID.unique(),
                    projectName,
                    selectedOrg,
                    isCloud ? (region as Region) : Region.Default
                );
                trackEvent(Submit.ProjectCreate, {
                    customId: !!id,
                    selectedOrg,
                    teamId: selectedOrg
                });

                selectedProject = p.$id;

                window.location.href = generateUrl();
            } catch (e) {
                trackError(e, Submit.ProjectCreate);
                addNotification({
                    type: 'error',
                    message: e.message
                });
            }
        } else {
            window.location.href = generateUrl();
        }
    }

    $effect(() => {
        if (selectedOrg !== undefined) {
            fetchProjects();
        }
    });
</script>

<svelte:head>
    <title>Deploy {data.template.name} - Appwrite</title>
</svelte:head>

<div style:max-width="592px" style:width="100%">
    <Card.Base padding="s" radius="l">
        <Layout.Stack gap="xl">
            <Layout.Stack gap="l">
                <Typography.Title size="m">
                    Deploy {data.product}
                </Typography.Title>
                <Card.Base variant="secondary" padding="xxxs" radius="s">
                    <Layout.GridFraction start={5} end={6}>
                        {#if isSiteTemplate(data.template, data.product)}
                            {@const framework = data.template.frameworks[0]}
                            <Image
                                border
                                radius="xs"
                                ratio="16/9"
                                style=" align-self: start"
                                src={$app.themeInUse === 'dark'
                                    ? data.template.screenshotDark ||
                                      `${base}/images/sites/screenshot-placeholder-dark.svg`
                                    : data.template.screenshotLight ||
                                      `${base}/images/sites/screenshot-placeholder-light.svg`}
                                alt="Screenshot" />
                            <Layout.Stack gap="xxl" justifyContent="center">
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

                            {#if projects?.total}
                                {#key selectedProject}
                                    <InputSelect
                                        id="project"
                                        label="Project"
                                        required
                                        options={[
                                            ...projects.projects.map((p) => ({
                                                label: p.name,
                                                value: p.$id
                                            })),
                                            {
                                                label: 'Create project',
                                                leadingIcon: IconPlusSm,
                                                value: null
                                            }
                                        ]}
                                        bind:value={selectedProject} />
                                {/key}
                            {/if}
                            {#if selectedProject === null}
                                <Layout.Stack direction="column" gap="s">
                                    <Input.Text
                                        label="Name"
                                        placeholder="Project name"
                                        required
                                        bind:value={projectName} />
                                    {#if !showCustomId}
                                        <div>
                                            <Tag
                                                size="s"
                                                on:click={() => {
                                                    showCustomId = true;
                                                }}
                                                ><Icon slot="start" icon={IconPencil} size="s" /> Project
                                                ID</Tag>
                                        </div>
                                    {/if}
                                    <CustomId
                                        bind:show={showCustomId}
                                        name="Project"
                                        isProject
                                        bind:id />
                                </Layout.Stack>
                                {#if isCloud}
                                    <Layout.Stack gap="xs">
                                        <Input.Select
                                            required
                                            bind:value={region}
                                            placeholder="Select a region"
                                            options={getRegions()}
                                            label="Region" />
                                        <Typography.Text>
                                            Region cannot be changed after creation
                                        </Typography.Text>
                                    </Layout.Stack>
                                {/if}
                            {/if}

                            <Divider />
                            <Layout.Stack direction="row-reverse">
                                <div>
                                    <Button
                                        disabled={!selectedOrg ||
                                            (!selectedProject && !projectName && !region)}
                                        submit>
                                        <span class="text">Continue</span>
                                    </Button>
                                </div>
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
