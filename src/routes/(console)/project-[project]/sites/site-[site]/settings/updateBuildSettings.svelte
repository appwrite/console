<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { Card, Fieldset, Icon, InlineCode, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { iconPath } from '$lib/stores/app';
    import { getFrameworkIcon } from '../../store';
    import { Link } from '$lib/elements';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { adapterDataList } from './store';

    export let site: Models.Site;
    export let frameworks: Models.Framework[];
    let selectedFramework: Models.Framework = frameworks.find(
        (framework) => framework.key === site.framework
    );
    let frameworkKey = site.framework;
    let adapter: Adapter = site.adapter as Adapter;
    let installCommand = site?.installCommand;
    let buildCommand = site?.buildCommand;
    let outputDirectory = site?.outputDirectory;
    let fallback = site?.fallbackFile;
    let isButtonDisabled = true;
    let showFallback = site.adapter === Adapter.Static;
    $: frameworkAdapterData = selectedFramework.adapters.find((a) => a.key === adapter);

    async function update() {
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

    $: if (
        installCommand === site?.installCommand &&
        buildCommand === site?.buildCommand &&
        outputDirectory === site?.outputDirectory &&
        selectedFramework?.key === site?.framework &&
        fallback === (site?.fallbackFile || undefined) &&
        adapter === site?.adapter
    ) {
        isButtonDisabled = true;
    } else {
        isButtonDisabled = false;
    }

    $: if (adapter === Adapter.Static) {
        showFallback = true;
        fallback ||= selectedFramework.adapters.find((a) => a.key === Adapter.Static).fallbackFile;
    } else {
        showFallback = false;
        fallback = undefined;
    }

    $: if (fallback === '') {
        fallback = null;
    }

    $: hasSSR = selectedFramework?.adapters?.some((a) => a?.key === Adapter.Ssr);
    $: hasStatic = selectedFramework?.adapters?.some((a) => a?.key === Adapter.Static);
    $: if (selectedFramework?.adapters?.length <= 1 || !hasSSR) {
        adapter = Adapter.Static;
    }
    $: if (selectedFramework?.adapters?.length <= 1 || !hasStatic) {
        adapter = Adapter.Ssr;
    }
</script>

<Form onSubmit={update}>
    <CardGrid>
        <svelte:fragment slot="title">Build settings</svelte:fragment>
        Default build settings are configured based on your framework, ensuring optimal performance.
        Adjust the settings here if needed.
        <svelte:fragment slot="aside">
            {@const adapterData = adapterDataList.find(
                (adapterData) => adapterData.framework === frameworkKey.toLowerCase()
            )}
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
                {#if selectedFramework.adapters?.length >= 2}
                    <Layout.Grid columnsXS={1} columns={2} gap="l">
                        <Card.Selector
                            title="Server side rendering"
                            variant="primary"
                            radius="s"
                            padding="s"
                            name="adapter"
                            value={`${Adapter.Ssr}`}
                            bind:group={adapter}>
                            {#if adapterData?.ssr?.desc?.includes('$')}
                                {@const parts = adapterData.ssr.desc.split('$')}
                                {#each parts as part, i}
                                    {#if i === 0}
                                        {part}
                                    {:else}
                                        <InlineCode code={adapterData.ssr.code[i - 1]} size="s" />
                                        {part}
                                    {/if}
                                {/each}
                            {:else}
                                {adapterData.ssr.desc}
                            {/if}
                            {#if adapterData.ssr.url}
                                <Link external href={adapterData.ssr.url}>Learn more</Link>
                            {/if}
                        </Card.Selector>
                        <Card.Selector
                            title="Static site"
                            variant="primary"
                            radius="s"
                            padding="s"
                            name="adapter"
                            value={Adapter.Static}
                            bind:group={adapter}>
                            {#if adapterData.static.desc.includes('$')}
                                {@const parts = adapterData.static.desc.split('$')}
                                {#each parts as part, i}
                                    {#if i === 0}
                                        {part}
                                    {:else}
                                        <InlineCode
                                            code={adapterData.static.code[i - 1]}
                                            size="s" />
                                        {part}
                                    {/if}
                                {/each}
                            {:else}
                                {adapterData.static.desc}
                            {/if}
                            {#if adapterData.static.url}
                                <Link external href={adapterData.static.url}>Learn more</Link>
                            {/if}
                        </Card.Selector>
                    </Layout.Grid>
                {/if}
                <Fieldset legend="Settings">
                    <Layout.Stack gap="xl">
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="installCommand"
                                label="Install command"
                                bind:value={installCommand}
                                placeholder={frameworkAdapterData?.installCommand} />

                            <Button
                                secondary
                                size="s"
                                on:click={() =>
                                    (installCommand =
                                        site?.installCommand ??
                                        selectedFramework.adapters[site.adapter]
                                            ?.defaultInstallCommand)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="buildCommand"
                                label="Build command"
                                bind:value={buildCommand}
                                placeholder={frameworkAdapterData?.buildCommand} />
                            <Button
                                secondary
                                size="s"
                                on:click={() =>
                                    (buildCommand =
                                        site?.buildCommand ??
                                        selectedFramework.adapters[site.adapter]
                                            ?.defaultBuildCommand)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="outputDirectory"
                                label="Output directory"
                                bind:value={outputDirectory}
                                placeholder={frameworkAdapterData?.outputDirectory} />
                            <Button
                                secondary
                                size="s"
                                on:click={() =>
                                    (outputDirectory =
                                        site?.outputDirectory ??
                                        selectedFramework.adapters[site.adapter]
                                            ?.defaultOutputDirectory)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        {#if showFallback}
                            <InputText
                                id="fallback"
                                label="Fallback file"
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
