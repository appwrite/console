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
    import { IconGithub, IconPencil, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import {
        Badge,
        Card,
        Divider,
        Icon,
        Input,
        Layout,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { filterRegions } from '$lib/helpers/regions';
    import { loadAvailableRegions } from '$routes/(console)/regions';
    import { regions as regionsStore } from '$lib/stores/organization';

    let { data } = $props();

    let projects = $state<Models.ProjectList>();
    let selectedProject = $state<string>();
    let selectedOrg = $state(
        data?.organizations?.total ? data.organizations.teams[0].$id : undefined
    );
    let projectName = $state<string>('');
    let showCustomId = $state(false);
    let region = $state<AllowedRegions>();
    let id = $state<string>('');

    let loadingProjects = $state(false);

    async function fetchProjects() {
        loadingProjects = true;

        projects = await sdk.forConsole.projects.list({
            queries: [Query.equal('teamId', selectedOrg), Query.orderDesc('')]
        });

        selectedProject = projects?.total ? projects.projects[0].$id : null;
        loadingProjects = false;
    }

    async function handleSubmit() {
        if (selectedProject === null) {
            try {
                loadingProjects = true;
                const project = await sdk.forConsole.projects.create({
                    projectId: id ?? ID.unique(),
                    name: projectName,
                    teamId: selectedOrg,
                    region: isCloud ? (region as Region) : undefined
                });

                selectedProject = project.$id;

                trackEvent(Submit.ProjectCreate, {
                    customId: !!id,
                    selectedOrg,
                    teamId: selectedOrg,
                    source: 'deploy-button-functions'
                });

                const deployUrl = buildDeployUrl(project);
                await goto(deployUrl);
            } catch (e) {
                trackError(e, Submit.ProjectCreate);
                addNotification({
                    type: 'error',
                    message: e.message
                });
            } finally {
                loadingProjects = false;
            }
        } else {
            const project = projects.projects.find((p) => p.$id === selectedProject);
            if (!project) {
                addNotification({ type: 'error', message: 'Selected project not found' });
                return;
            }
            await goto(buildDeployUrl(project));
        }
    }

    function buildDeployUrl(project: Models.Project) {
        let url: URL;
        const projectRegion = isCloud ? region : 'default';

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
        if (rootDir)
            url.searchParams.set(
                'rootDir',
                rootDir || data.deploymentData.repository.rootDirectory
            );

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

    $effect(() => {
        if (isCloud && selectedOrg) {
            loadAvailableRegions(selectedOrg);
        }
    });

    $effect(() => {
        if (isCloud && $regionsStore.regions?.length > 0 && !region) {
            region = $regionsStore.regions.find((r) => r.default)?.$id as AllowedRegions;
        }
    });
</script>

<svelte:head>
    <title>Deploy {data.deploymentData.name} - Appwrite</title>
</svelte:head>

<div class="auth-bg">
    <section class="console-container">
        <div style:max-width="592px" style:width="100%">
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
                                                <Badge
                                                    content={envKey}
                                                    size="s"
                                                    variant="secondary" />
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
                                    options={data.organizations.teams.map((o) => ({
                                        label: o.name,
                                        value: o.$id
                                    }))}
                                    bind:value={selectedOrg} />

                                <InputSelect
                                    id="project"
                                    label="Project"
                                    required
                                    placeholder={loadingProjects
                                        ? 'Loading projects...'
                                        : undefined}
                                    disabled={loadingProjects}
                                    options={[
                                        ...(projects?.projects?.map((p) => ({
                                            label: p.name,
                                            value: p.$id
                                        })) ?? []),
                                        {
                                            label: 'Create project',
                                            leadingIcon: IconPlus,
                                            value: null
                                        }
                                    ]}
                                    bind:value={selectedProject} />

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
                                                (selectedProject === 'create-new' &&
                                                    (!projectName || (isCloud && !region)))}
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
        </div>
    </section>
    <footer>
        {#if $app.themeInUse === 'dark'}
            <img
                src="{base}/images/appwrite-logo-dark.svg"
                width="120"
                height="22"
                alt="Appwrite Logo" />
        {:else}
            <img
                src="{base}/images/appwrite-logo-light.svg"
                width="120"
                height="22"
                alt="Appwrite Logo" />
        {/if}
    </footer>
</div>

<style lang="scss">
    .auth-bg {
        position: fixed;
        background: var(--bgcolor-neutral-default, #fff);
        background-size: cover;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        section {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }
        footer {
            padding: 2rem 1rem;
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
        }
    }
</style>
