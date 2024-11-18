<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { BuildRuntime, Framework, ServeRuntime, type Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let site: Models.Site;
    export let frameworks: Models.Framework[];
    let selectedFramework = null;
    let installCommand = undefined;
    let buildCommand = undefined;
    let outputDirectory = undefined;
    let frameworkKey = site.framework;
    let isButtonDisabled = true;

    onMount(async () => {
        selectedFramework ??= frameworks.find((framework) => framework.key === site.framework);

        // TODO: ask backend to add missing defaults
        installCommand = site?.installCommand ?? selectedFramework.installCommand;
        buildCommand = site?.buildCommand ?? selectedFramework.buildCommand;
        outputDirectory = site?.outputDirectory ?? selectedFramework.outputDirectory;
    });

    async function updateName() {
        try {
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                Framework[selectedFramework.key],
                site.enabled || undefined,
                site.timeout || undefined,
                installCommand || undefined,
                buildCommand || undefined,
                outputDirectory || undefined,
                BuildRuntime[site?.buildRuntime] || undefined,
                ServeRuntime[site?.serveRuntime] || undefined,
                site.installationId || undefined,
                site.providerRepositoryId || undefined,
                site.providerBranch || undefined,
                site.providerSilentMode || undefined,
                site.providerRootDirectory || undefined,
                site.specification || undefined
            );
            await invalidate(Dependencies.SITE);
            addNotification({
                message: 'Build settings have been updated',
                type: 'success'
            });
            trackEvent(Submit.SiteUpdateBuildSettings);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.SiteUpdateBuildSettings);
        }
    }

    $: frameworkData = frameworks.find((framework) => framework.$id === framework.$id);
    $: if (
        installCommand === site?.installCommand &&
        buildCommand === site?.buildCommand &&
        outputDirectory === site?.outputDirectory &&
        selectedFramework?.key === site?.framework
    ) {
        isButtonDisabled = true;
    } else {
        isButtonDisabled = false;
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">Build settings</Heading>
        <p class="text">
            Default build settings are configured based on your framework, ensuring optimal
            performance. Adjust the settings here if needed.
        </p>
        <svelte:fragment slot="aside">
            <InputSelect
                id="framework"
                label="Framework"
                placeholder="Select framework"
                bind:value={frameworkKey}
                options={frameworks.map((framework) => ({
                    value: framework.key,
                    label: framework.name
                }))}
                on:change={() => {
                    selectedFramework = frameworks.find(
                        (framework) => framework.key === frameworkKey
                    );
                }} />

            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                <InputText
                    id="installCommand"
                    label="Install command"
                    bind:value={installCommand}
                    placeholder={frameworkData?.installCommand} />
                <Button secondary size="s" on:click={() => (installCommand = '')}>Reset</Button>
            </Layout.Stack>
            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                <InputText
                    id="buildCommand"
                    label="Build command"
                    bind:value={buildCommand}
                    placeholder={frameworkData?.buildCommand} />
                <Button secondary size="s" on:click={() => (buildCommand = '')}>Reset</Button>
            </Layout.Stack>
            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                <InputText
                    id="outputDirectory"
                    label="Output directory"
                    bind:value={outputDirectory}
                    placeholder={frameworkData?.outputDirectory} />
                <Button secondary size="s" on:click={() => (outputDirectory = '')}>Reset</Button>
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isButtonDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
