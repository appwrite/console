<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { Card, Fieldset, Icon, InlineCode, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { iconPath } from '$lib/stores/app';
    import { getFrameworkIcon } from '../../store';
    import { Link } from '$lib/elements';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

    export let site: Models.Site;
    export let frameworks: Models.Framework[];
    let selectedFramework: Models.Framework = null;
    let installCommand = undefined;
    let buildCommand = undefined;
    let outputDirectory = undefined;
    let frameworkKey = site.framework;
    let adapter: Adapter = site.adapter as Adapter;
    let fallback = site.fallbackFile;
    let isButtonDisabled = true;
    let showFallback = site.adapter === Adapter.Static;

    onMount(async () => {
        selectedFramework ??= frameworks.find((framework) => framework.key === site.framework);

        installCommand =
            site?.installCommand ?? selectedFramework.adapters[site.adapter].defaultInstallCommand;
        buildCommand =
            site?.buildCommand ?? selectedFramework.adapters[site.adapter].defaultBuildCommand;
        outputDirectory =
            site?.outputDirectory ??
            selectedFramework.adapters[site.adapter].defaultOutputDirectory;
    });

    async function updateName() {
        try {
            await sdk.forProject.sites.update(
                site.$id,
                site.name,
                selectedFramework.key as Framework,
                site.enabled || undefined,
                site.timeout || undefined,
                installCommand || undefined,
                buildCommand || undefined,
                outputDirectory || undefined,
                (site?.buildRuntime as BuildRuntime) || undefined,
                adapter || undefined,
                fallback || undefined,
                site.installationId || undefined,
                site.providerRepositoryId || undefined,
                site.providerBranch || undefined,
                site.providerSilentMode || undefined,
                site.providerRootDirectory || undefined
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

    $: frameworkData = frameworks.find((framework) => framework.key === frameworkKey);
    $: if (
        installCommand === site?.installCommand &&
        buildCommand === site?.buildCommand &&
        outputDirectory === site?.outputDirectory &&
        selectedFramework?.key === site?.framework &&
        fallback === site?.fallbackFile
    ) {
        isButtonDisabled = true;
    } else {
        isButtonDisabled = false;
    }

    $: if (adapter === Adapter.Static) {
        showFallback = true;
    } else {
        showFallback = false;
    }

    $: if (fallback === '') {
        fallback = null;
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Build settings</svelte:fragment>
        Default build settings are configured based on your framework, ensuring optimal performance.
        Adjust the settings here if needed.
        <svelte:fragment slot="aside">
            <Layout.Stack gap="xl">
                <InputSelect
                    required
                    id="framework"
                    label="Framework"
                    placeholder="Select framework"
                    bind:value={frameworkKey}
                    options={frameworks.map((framework) => ({
                        value: framework.key,
                        label: framework.name,
                        leadingHtml: `<img src='${$iconPath(getFrameworkIcon(framework.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
                    }))}
                    on:change={() => {
                        selectedFramework = frameworks.find(
                            (framework) => framework.key === frameworkKey
                        );
                    }} />
                <Layout.Grid columnsXS={1} columns={2} gap="l">
                    <Card.Selector
                        title="Server side rendering"
                        variant="primary"
                        radius="s"
                        padding="s"
                        value={Adapter.Ssr}
                        bind:group={adapter}>
                        Use <InlineCode code={`${frameworkKey}/node`} size="s" /> adapter in your {frameworkData.name}
                        config file. <Link external href="#">Learn more</Link>.
                    </Card.Selector>
                    <Card.Selector
                        title="Static site"
                        variant="primary"
                        radius="s"
                        padding="s"
                        value={Adapter.Static}
                        bind:group={adapter}>
                        Use <InlineCode code={`${frameworkKey}/static`} size="s" /> adapter in your {frameworkData.name}
                        config file. <Link external href="#">Learn more</Link>.
                    </Card.Selector>
                </Layout.Grid>
                <Fieldset legend="Settings">
                    <Layout.Stack gap="xl">
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="installCommand"
                                label="Install command"
                                bind:value={installCommand}
                                placeholder={frameworkData.adapters[site.adapter]
                                    .defaultInstallCommand} />

                            <Button
                                secondary
                                size="s"
                                on:click={() =>
                                    (installCommand =
                                        site?.installCommand ??
                                        selectedFramework.adapters[site.adapter]
                                            .defaultInstallCommand)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="buildCommand"
                                label="Build command"
                                bind:value={buildCommand}
                                placeholder={frameworkData.adapters[site.adapter]
                                    .defaultBuildCommand} />
                            <Button
                                secondary
                                size="s"
                                on:click={() =>
                                    (buildCommand =
                                        site?.buildCommand ??
                                        selectedFramework.adapters[site.adapter]
                                            .defaultbuildCommand)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="outputDirectory"
                                label="Output directory"
                                bind:value={outputDirectory}
                                placeholder={frameworkData.adapters[site.adapter]
                                    .defaultOutputDirectory} />
                            <Button
                                secondary
                                size="s"
                                on:click={() =>
                                    (outputDirectory =
                                        site?.outputDirectory ??
                                        selectedFramework.adapters[site.adapter]
                                            .defaultoutputDirectory)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        {#if showFallback}
                            <InputText
                                id="fallback"
                                label="Fallback file"
                                required
                                placeholder="index.html"
                                bind:value={fallback}>
                                <Tooltip slot="info">
                                    <Icon icon={IconInfo} size="s" />
                                    <span slot="tooltip">
                                        Provide a fallback file for advanced routing and proper page
                                        handling in SPA mode.
                                    </span>
                                </Tooltip>
                            </InputText>
                        {/if}
                    </Layout.Stack>
                </Fieldset>
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isButtonDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
