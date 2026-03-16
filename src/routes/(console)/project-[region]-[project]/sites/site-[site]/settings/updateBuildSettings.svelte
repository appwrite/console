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
    import { Link } from '$lib/elements';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { adapterDataList } from './store';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import { page } from '$app/state';

    let {
        site,
        frameworks,
        specs
    }: {
        site: Models.Site;
        frameworks: Models.Framework[];
        specs: Models.SpecificationList;
    } = $props();

    let frameworkKey = $state(site.framework);
    let installCommand = $state(site?.installCommand);
    let buildCommand = $state(site?.buildCommand);
    let outputDirectory = $state(site?.outputDirectory);
    let fallback = $state(site?.fallbackFile);
    let adapter: Adapter = $state(site.adapter as Adapter);

    let selectedFramework: Models.Framework = $derived(
        frameworks.find((framework) => framework.key === site.framework)
    );
    let showFallback = $derived(adapter === Adapter.Static);

    let isUntouched = $derived(
        installCommand === site?.installCommand &&
            buildCommand === site?.buildCommand &&
            outputDirectory === site?.outputDirectory &&
            selectedFramework?.key === site?.framework &&
            (fallback ?? '') === (site?.fallbackFile ?? '') &&
            (adapter ?? '') === (site?.adapter ?? '')
    );
    let frameworkAdapterData = $derived(
        selectedFramework.adapters.find((a) => a.key === adapter) ?? selectedFramework.adapters[0]
    );

    $effect(() => {
        if (adapter) {
            const data = selectedFramework.adapters.find((a) => a.key === adapter);
            if (data) {
                installCommand = data.installCommand;
                buildCommand = data.buildCommand;
                outputDirectory = data.outputDirectory;
                fallback = data.fallbackFile;
            }
        }
    });

    $effect(() => {
        if (selectedFramework?.key !== site.framework) {
            // Update adapter
            const singleAdapter = selectedFramework?.adapters?.length <= 1;
            if (singleAdapter) {
                const hasSSR = selectedFramework?.adapters?.some((a) => a?.key === Adapter.Ssr);
                const hasStatic = selectedFramework?.adapters?.some(
                    (a) => a?.key === Adapter.Static
                );
                if (!hasSSR) {
                    adapter = Adapter.Static;
                } else if (!hasStatic) {
                    adapter = Adapter.Ssr;
                }
            }

            //Update values
            const data =
                selectedFramework.adapters.find((a) => a.key === adapter) ??
                selectedFramework.adapters[0];
            installCommand = data.installCommand;
            buildCommand = data.buildCommand;
            outputDirectory = data.outputDirectory;
            adapter = data.key as Adapter;
            fallback = data.fallbackFile;
        } else {
            adapter = site.adapter as Adapter;
            installCommand = site?.installCommand ?? frameworkAdapterData.installCommand;
            buildCommand = site?.buildCommand ?? frameworkAdapterData.buildCommand;
            outputDirectory = site?.outputDirectory ?? frameworkAdapterData.outputDirectory;
            fallback = site?.fallbackFile ?? frameworkAdapterData.fallbackFile;
        }
    });

    $effect(() => {
        if (adapter === Adapter.Static) {
            if (!fallback) {
                fallback ||= selectedFramework.adapters.find(
                    (a) => a.key === Adapter.Static
                ).fallbackFile;
            }
        }
    });

    $effect(() => {
        if (selectedFramework) {
            if (!selectedFramework.adapters.some((a) => a.key === adapter)) {
                adapter = selectedFramework.adapters[0].key as Adapter;
                site.adapter = adapter;
            }
            if (specs && specs.specifications?.length) {
                if (!specs.specifications.some((s) => s.slug === site.specification)) {
                    site.specification = specs.specifications[0].slug;
                }
            }
        }
    });

    async function update() {
        let adptr = selectedFramework.adapters.find((a) => a.key === adapter);
        if (!adptr?.key && selectedFramework.adapters?.length) {
            adapter = selectedFramework.adapters[0].key as Adapter;
            adptr = selectedFramework.adapters[0];
            site.adapter = adapter;
        }
        // only allow enabled specsification for it
        const enabledSpecs = specs?.specifications?.filter((s) => s.enabled) ?? [];
        let specToSend = enabledSpecs.some((s) => s.slug === site.specification)
            ? site.specification
            : enabledSpecs[0]?.slug;
        site.specification = specToSend;
        try {
            await sdk.forProject(page.params.region, page.params.project).sites.update({
                siteId: site.$id,
                name: site.name,
                framework: selectedFramework.key as Framework,
                enabled: site.enabled || undefined,
                logging: site.logging || undefined,
                timeout: site.timeout || undefined,
                installCommand: installCommand || undefined,
                buildCommand: buildCommand || undefined,
                outputDirectory: outputDirectory || undefined,
                buildRuntime: (site?.buildRuntime as BuildRuntime) || undefined,
                adapter: (adptr?.key as Adapter) || undefined,
                fallbackFile: adptr?.key === 'static' ? fallback || undefined : undefined,
                installationId: site.installationId || undefined,
                providerRepositoryId: site.providerRepositoryId || undefined,
                providerBranch: site.providerBranch || undefined,
                providerSilentMode: site.providerSilentMode || undefined,
                providerRootDirectory: site.providerRootDirectory || undefined,
                specification: specToSend || undefined
            });
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

    function reset(type: 'installCommand' | 'buildCommand' | 'outputDirectory') {
        const data = selectedFramework.adapters.find((a) => a.key === adapter);

        if (type === 'installCommand') {
            installCommand = data.installCommand;
        } else if (type === 'buildCommand') {
            buildCommand = data.buildCommand;
        } else if (type === 'outputDirectory') {
            outputDirectory = data.outputDirectory;
        }
    }
</script>

<Form onSubmit={update}>
    <CardGrid>
        <svelte:fragment slot="title">Build settings</svelte:fragment>
        Default build settings are configured based on your framework, ensuring optimal performance. Adjust
        the settings here if needed.
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
                            {:else if adapterData?.ssr?.desc}
                                {adapterData.ssr.desc}
                            {/if}
                            {#if adapterData?.ssr?.url}
                                <Link variant="muted" size="m" external href={adapterData.ssr.url}
                                    >Learn more</Link>
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
                            {#if adapterData?.static?.desc?.includes('$')}
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
                            {:else if adapterData?.ssr?.desc}
                                {adapterData.static.desc}
                            {/if}
                            {#if adapterData?.static?.url}
                                <Link
                                    variant="muted"
                                    size="m"
                                    external
                                    href={adapterData.static.url}>Learn more</Link>
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
                                placeholder={frameworkAdapterData?.installCommand ||
                                    'Enter install command'} />

                            <Button
                                secondary
                                size="s"
                                on:click={() => reset('installCommand')}
                                disabled={installCommand === frameworkAdapterData?.installCommand}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="buildCommand"
                                label="Build command"
                                bind:value={buildCommand}
                                placeholder={frameworkAdapterData?.buildCommand ||
                                    'Enter build command'} />
                            <Button
                                secondary
                                size="s"
                                disabled={buildCommand === frameworkAdapterData?.buildCommand}
                                on:click={() => reset('buildCommand')}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="outputDirectory"
                                label="Output directory"
                                bind:value={outputDirectory}
                                placeholder={frameworkAdapterData?.outputDirectory ||
                                    'Enter output directory'} />
                            <Button
                                secondary
                                size="s"
                                disabled={(outputDirectory ?? '') ===
                                    (frameworkAdapterData?.outputDirectory ?? '')}
                                on:click={() => reset('outputDirectory')}>
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
            <Button disabled={isUntouched} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
