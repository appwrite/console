<script lang="ts">
    import { Button, InputSelect, InputText } from '$lib/elements/forms';
    import { Fieldset, Layout, Accordion } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { iconPath } from '$lib/stores/app';
    import { getFrameworkIcon } from '$lib/stores/sites';
    import EnvironmentVariables from '$lib/components/variables/environmentVariables.svelte';

    export let frameworks: Models.Framework[];
    export let selectedFramework: Models.Framework;
    $: frameworkData = frameworks.find((framework) => framework.key === selectedFramework?.key);
    $: adapterData =
        frameworkData?.adapters.find((adapter) => adapter.key === 'ssr') ??
        frameworkData?.adapters.find((adapter) => adapter.key === 'static');

    export let variables: Partial<Models.Variable>[] = [];
    export let isVariablesLoading = false;
    export let installCommand = '';
    export let buildCommand = '';
    export let outputDirectory = '';

    let frameworkId = selectedFramework.key;

    $: if (!installCommand || !buildCommand || !outputDirectory) {
        installCommand ||= adapterData?.installCommand;
        buildCommand ||= adapterData?.buildCommand;
        outputDirectory ||= adapterData?.outputDirectory;
    }

    $: if (frameworkData) {
        installCommand = adapterData?.installCommand;
        buildCommand = adapterData?.buildCommand;
        outputDirectory = adapterData?.outputDirectory;
    }
</script>

<Fieldset legend="Settings">
    <Layout.Stack gap="l">
        <InputSelect
            id="framework"
            label="Framework"
            placeholder="Select framework"
            bind:value={frameworkId}
            options={frameworks.map((framework) => ({
                value: framework.key,
                label: framework.name,
                leadingHtml: `<img src='${$iconPath(getFrameworkIcon(framework.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
            }))}
            on:change={() => {
                selectedFramework = frameworks.find((framework) => framework.key === frameworkId);
            }} />

        <Layout.Stack>
            <Accordion title="Build settings" badge="Optional">
                <Layout.Stack gap="xl">
                    Set up how your project is built and where the output files are stored.
                    <Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="installCommand"
                                label="Install command"
                                bind:value={installCommand}
                                placeholder={adapterData?.installCommand ||
                                    'Enter install command'} />
                            <Button
                                secondary
                                size="s"
                                disabled={adapterData?.installCommand === installCommand}
                                on:click={() => (installCommand = adapterData?.installCommand)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="buildCommand"
                                label="Build command"
                                bind:value={buildCommand}
                                placeholder={adapterData?.buildCommand || 'Enter build command'} />
                            <Button
                                secondary
                                size="s"
                                disabled={adapterData?.buildCommand === buildCommand}
                                on:click={() => (buildCommand = adapterData?.buildCommand)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                        <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                            <InputText
                                id="outputDirectory"
                                label="Output directory"
                                bind:value={outputDirectory}
                                placeholder={adapterData?.outputDirectory ||
                                    'Enter output directory'} />
                            <Button
                                secondary
                                size="s"
                                disabled={adapterData?.outputDirectory === outputDirectory}
                                on:click={() => (outputDirectory = adapterData?.outputDirectory)}>
                                Reset
                            </Button>
                        </Layout.Stack>
                    </Layout.Stack>
                </Layout.Stack>
            </Accordion>

            <EnvironmentVariables bind:variables isLoading={isVariablesLoading} />
        </Layout.Stack>
    </Layout.Stack>
</Fieldset>
