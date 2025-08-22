<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import CustomId from '$lib/components/customId.svelte';
    import { Button, Form, InputSelect } from '$lib/elements/forms';
    import type { AllowedRegions } from '$lib/sdk/billing.js';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { isCloud } from '$lib/system';
    import { ID, Query, type Models, Region } from '@appwrite.io/console';
    import { IconGithub, IconPencil, IconPlusSm } from '@appwrite.io/pink-icons-svelte';
    import { Card, Divider, Icon, Input, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { filterRegions } from '$lib/helpers/regions';
    import { loadAvailableRegions } from '$routes/(console)/regions';
    import { regions as regionsStore } from '$lib/stores/organization';

    let { data } = $props();

    let projects = $state<Models.ProjectList>();
    let selectedProject = $state<string>();
    let selectedOrg = $state(
        data?.organizations?.total ? data.organizations.teams[0].$id : undefined
    );
    let projectName = $state<string>();
    let showCustomId = $state(false);
    let region = $state<AllowedRegions>();
    let id = $state<string>();
    async function fetchProjects() {
        projects = await sdk.forConsole.projects.list([
            Query.equal('teamId', selectedOrg),
            Query.orderDesc('')
        ]);
        selectedProject = projects?.total ? projects.projects[0].$id : null;
    }

    async function handleSubmit() {
        if (selectedProject === null) {
            try {
                const p = await sdk.forConsole.projects.create(
                    id ?? ID.unique(),
                    projectName,
                    selectedOrg,
                    isCloud ? (region as Region) : undefined
                );
                trackEvent(Submit.ProjectCreate, {
                    customId: !!id,
                    selectedOrg,
                    teamId: selectedOrg,
                    source: 'deploy-button-functions'
                });

                selectedProject = p.$id;

                const deployUrl = buildDeployUrl(p);
                await goto(deployUrl);
            } catch (e) {
                trackError(e, Submit.ProjectCreate);
                addNotification({
                    type: 'error',
                    message: e.message
                });
            }
        } else {
            const project = projects.projects.find((p) => p.$id === selectedProject);
            const deployUrl = buildDeployUrl(project);
            await goto(deployUrl);
        }
    }

    function buildDeployUrl(project: Models.Project) {
        // Use the selected region or default to 'default' if not available
        const projectRegion = isCloud ? region : 'default';
        let url: URL;

        // For repository deployments, navigate to the deploy page
        url = new URL(
            `${base}/project-${projectRegion}-${project.$id}/functions/create-function/deploy`,
            window.location.origin
        );
        url.searchParams.set('repo', data.deploymentData.repository.url);

        // Pass runtime if specified from original URL
        if (data.deploymentData.runtime) {
            url.searchParams.set('runtime', data.deploymentData.runtime);
        }

        // Pass through additional build configuration params if present
        const currentUrl = new URL(window.location.href);
        const entrypoint = currentUrl.searchParams.get('entrypoint');
        const install = currentUrl.searchParams.get('install');
        const build = currentUrl.searchParams.get('build');
        const rootDir = currentUrl.searchParams.get('rootDir');

        if (entrypoint) url.searchParams.set('entrypoint', entrypoint);
        if (install) url.searchParams.set('install', install);
        if (build) url.searchParams.set('build', build);
        if (rootDir) url.searchParams.set('rootDir', rootDir);

        if (data.envKeys.length > 0) {
            url.searchParams.set('env', data.envKeys.join(','));
        }

        return url.toString();
    }

    $effect(() => {
        if (selectedOrg !== undefined) {
            fetchProjects();
        }
    });

    // Load regions when organization is selected
    $effect(() => {
        if (isCloud && selectedOrg) {
            loadAvailableRegions(selectedOrg);
        }
    });

    // Set default region when regions are loaded
    $effect(() => {
        if (isCloud && $regionsStore.regions?.length > 0 && !region) {
            region = $regionsStore.regions.find((r) => r.default)?.$id as AllowedRegions;
        }
    });
</script>

<svelte:head>
    <title>Deploy {data.deploymentData.name} - Appwrite</title>
</svelte:head>

<div
    style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem;">
    <div style:max-width="592px" style:width="100%">
        <Layout.Stack gap="xl" alignItems="center">
            {#if $app.themeInUse === 'dark'}
                <img
                    src="{base}/images/appwrite-logo-dark.svg"
                    width="150"
                    height="28"
                    alt="Appwrite Logo" />
            {:else}
                <img
                    src="{base}/images/appwrite-logo-light.svg"
                    width="150"
                    height="28"
                    alt="Appwrite Logo" />
            {/if}
            <Card.Base padding="s" radius="l" style="width: 100%;">
                <Layout.Stack gap="xl">
                    <Layout.Stack gap="l">
                        <Typography.Title size="m">Deploy function</Typography.Title>
                        <Card.Base variant="secondary" padding="s" radius="s">
                            <Layout.Stack gap="m">
                                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                                    Repository
                                </Typography.Text>
                                <Layout.Stack direction="row" alignItems="center" gap="s">
                                    <Icon icon={IconGithub} size="m" />
                                    <Typography.Text variant="m-400">
                                        {data.deploymentData.repository.owner}/{data.deploymentData
                                            .repository.name}
                                    </Typography.Text>
                                </Layout.Stack>
                                {#if data.envKeys.length > 0}
                                    <Divider />
                                    <Layout.Stack gap="s">
                                        <Typography.Text
                                            variant="m-500"
                                            color="--fgcolor-neutral-primary">
                                            Environment Variables Required
                                        </Typography.Text>
                                        <Layout.Stack direction="row" gap="xs" wrap="wrap">
                                            {#each data.envKeys as envKey}
                                                <Tag size="s">{envKey}</Tag>
                                            {/each}
                                        </Layout.Stack>
                                    </Layout.Stack>
                                {/if}
                            </Layout.Stack>
                        </Card.Base>

                        <Form onSubmit={handleSubmit}>
                            <Layout.Stack gap="xl">
                                <InputSelect
                                    id="organization"
                                    label="Organization"
                                    required
                                    placeholder="Select an organization"
                                    options={data.organizations.teams.map((o: any) => ({
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
                                                    ><Icon
                                                        slot="start"
                                                        icon={IconPencil}
                                                        size="s" /> Project ID</Tag>
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
                                                options={filterRegions($regionsStore.regions || [])}
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
                    </Layout.Stack>
                </Layout.Stack>
            </Card.Base>
        </Layout.Stack>
    </div>
</div>
