<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Card } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { Wizard } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { installation, repository } from '$lib/stores/vcs';
    import { Layout, Icon, Typography } from '@appwrite.io/pink-svelte';
    import { IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { writable } from 'svelte/store';
    import Details from '../../details.svelte';
    import ProductionBranch from '$lib/components/git/productionBranchFieldset.svelte';
    import Aside from '../../aside.svelte';
    import {
        BuildRuntime,
        Framework,
        ID,
        VCSDeploymentType,
        VCSDetectionType
    } from '@appwrite.io/console';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import Configuration from '../../configuration.svelte';
    import { consoleVariables } from '$routes/(console)/store';
    import Domain from '../../domain.svelte';

    export let data;
    let showExitModal = false;

    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '';
    let id = ID.unique();
    let framework: Models.Framework = data.frameworks.frameworks.find((f) => f.key === 'other');
    let adapter = framework?.adapters[0];
    let branch: string;
    let rootDir = './';
    let installCommand = adapter?.installCommand;
    let buildCommand = adapter?.buildCommand;
    let outputDirectory = adapter?.outputDirectory;
    let variables: Partial<Models.Variable>[] = [];
    let silentMode = false;
    let domain = data.domain;
    let domainIsValid = true;

    onMount(async () => {
        installation.set(data.installation);
        repository.set(data.repository);
        name = data.repository.name;

        await detectFramework();
    });

    async function detectFramework() {
        try {
            const response = await sdk.forProject.vcs.createRepositoryDetection(
                $installation.$id,
                data.repository.id,
                VCSDetectionType.Framework,
                rootDir
            );
            framework = data.frameworks.frameworks.find((f) => f.key === response.framework);
            adapter = framework?.adapters[0];
            installCommand = adapter?.installCommand;
            buildCommand = adapter?.buildCommand;
            outputDirectory = adapter?.outputDirectory;
            trackEvent(Submit.FrameworkDetect, {
                source: 'repository',
                framework: framework.key
            });
        } catch (error) {
            framework = data.frameworks.frameworks.find((f) => f.key === 'other');
            trackError(error, Submit.FrameworkDetect);
        }
    }

    async function create() {
        if (!domainIsValid) {
            addNotification({
                type: 'error',
                message: 'Domain is not valid'
            });
            return;
        }
        try {
            const fr = Object.values(Framework).find((f) => f === framework.key);
            const buildRuntime = Object.values(BuildRuntime).find(
                (f) => f === framework.buildRuntime
            );
            let site = await sdk.forProject.sites.create(
                id || ID.unique(),
                name,
                fr,
                buildRuntime,
                undefined,
                undefined,
                undefined,
                installCommand,
                buildCommand,
                outputDirectory,
                undefined,
                data.installation.$id,
                undefined,
                data.repository.id,
                branch,
                silentMode,
                rootDir
            );

            // Add domain
            await sdk.forProject.proxy.createSiteRule(
                `${domain}.${$consoleVariables._APP_DOMAIN_SITES}`,
                site.$id
            );

            //Add variables
            const promises = variables.map((variable) =>
                sdk.forProject.sites.createVariable(
                    site.$id,
                    variable.key,
                    variable.value,
                    variable?.secret ?? false
                )
            );
            await Promise.all(promises);

            const deployment = await sdk.forProject.sites.createVcsDeployment(
                site.$id,
                VCSDeploymentType.Branch,
                branch,
                true
            );

            trackEvent(Submit.SiteCreate, {
                source: 'repository',
                framework: framework.key
            });

            await goto(
                `${base}/project-${page.params.project}/sites/create-site/deploying?site=${site.$id}&deployment=${deployment.$id}`
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.SiteCreate);
        }
    }
</script>

<svelte:head>
    <title>Create site - Appwrite</title>
</svelte:head>

<Wizard
    title="Create site"
    bind:showExitModal
    href={`${base}/project-${page.params.project}/sites/`}
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xl">
            <Card radius="s" padding="s">
                <Layout.Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="xs">
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Icon icon={IconGithub} color="--fgcolor-neutral-primary" />
                        <Typography.Text variation="m-500" color="--fgcolor-neutral-primary">
                            {data.repository?.organization}/{data.repository?.name}
                        </Typography.Text>
                    </Layout.Stack>
                    <Button
                        secondary
                        href={`${base}/project-${page.params.project}/sites/create-site/repositories`}>
                        Change
                    </Button>
                </Layout.Stack>
            </Card>
            <Details bind:name bind:id />

            <ProductionBranch
                bind:branch
                bind:rootDir
                bind:silentMode
                product="sites"
                installationId={data.installation.$id}
                repositoryId={data.repository.id} />

            {#key framework.key}
                <Configuration
                    bind:installCommand
                    bind:buildCommand
                    bind:outputDirectory
                    bind:selectedFramework={framework}
                    bind:variables
                    frameworks={data.frameworks.frameworks} />
            {/key}

            <Domain bind:domain bind:domainIsValid />
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside {framework} repositoryName={data.repository.name} {branch} {rootDir} />
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Deploy
        </Button>
    </svelte:fragment>
</Wizard>
