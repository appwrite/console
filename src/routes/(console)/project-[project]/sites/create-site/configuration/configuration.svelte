<script lang="ts">
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import { Button, InputSelect, InputText } from '$lib/elements/forms';
    import { Fieldset, Layout, Tag } from '@appwrite.io/pink-svelte';

    const FRAMEWORKS_AVAILABLE = [
        {
            id: 'react',
            name: 'React',
            installCommand: 'npm install react react-dom',
            buildCommand: 'npm run build',
            outputDirectory: 'build'
        },
        {
            id: 'vue',
            name: 'Vue',
            installCommand: 'npm install vue',
            buildCommand: 'npm run build',
            outputDirectory: 'dist'
        },
        {
            id: 'svelte',
            name: 'Svelte',
            installCommand: 'npm install svelte',
            buildCommand: 'npm run build',
            outputDirectory: 'public'
        },
        {
            id: 'next',
            name: 'Next.js',
            installCommand: 'npm install next react react-dom',
            buildCommand: 'npm run build',
            outputDirectory: 'out'
        },
        {
            id: 'nuxt',
            name: 'Nuxt.js',
            installCommand: 'npm install nuxt',
            buildCommand: 'npm run build',
            outputDirectory: 'dist'
        }
    ];

    export let source: 'custom' | 'template' = 'custom';
    export let framework = FRAMEWORKS_AVAILABLE[0].id;
    export let variables = [];

    let { requiredVariables, optionalVariables } = variables.reduce(
        (acc, variable) => {
            if (variable.required) {
                acc.requiredVariables.push(variable);
            } else {
                acc.optionalVariables.push(variable);
            }
            return acc;
        },
        { requiredVariables: [], optionalVariables: [] }
    );

    let installCommand = '';
    let buildCommand = '';
    let outputDirectory = '';
</script>

{#if source === 'custom' || variables?.length}
    <Fieldset legend="Details">
        <Layout.Stack gap="l">
            {#if source === 'custom'}
                <InputSelect
                    id="framework"
                    label="Framework"
                    placeholder="Select framework"
                    bind:value={framework}
                    options={FRAMEWORKS_AVAILABLE.map((framework) => ({
                        value: framework.id,
                        label: framework.name
                    }))} />
            {/if}

            <Collapsible>
                {#if source === 'custom'}
                    {@const frameworkData = FRAMEWORKS_AVAILABLE.find((f) => f.id === framework)}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            Build settings <Tag size="small">Optional</Tag>
                        </svelte:fragment>
                        <Layout.Stack>
                            Set up how your project is built and where the output files are stored.
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="installCommand"
                                    label="Install command"
                                    bind:value={installCommand}
                                    placeholder={frameworkData.installCommand} />
                                <Button
                                    secondary
                                    size="small"
                                    on:click={() => (installCommand = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="buildCommand"
                                    label="Build command"
                                    bind:value={buildCommand}
                                    placeholder={frameworkData.buildCommand} />
                                <Button secondary size="small" on:click={() => (buildCommand = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="outputDirectory"
                                    label="Output directory"
                                    bind:value={outputDirectory}
                                    placeholder={frameworkData.outputDirectory} />
                                <Button
                                    secondary
                                    size="small"
                                    on:click={() => (outputDirectory = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                        </Layout.Stack>
                    </CollapsibleItem>
                {/if}
                {#if requiredVariables?.length}
                    <CollapsibleItem>
                        <svelte:fragment slot="title"
                            >Required environment variables</svelte:fragment>
                        Provide the values for the required environment variables to run this application.
                    </CollapsibleItem>
                {/if}
                {#if optionalVariables?.length}
                    <CollapsibleItem>
                        <svelte:fragment slot="title"
                            >Environment variables <Tag size="small">Optional</Tag
                            ></svelte:fragment>
                        Set up environment variables to securely manage keys and settings for your project.
                    </CollapsibleItem>
                {/if}
            </Collapsible>
        </Layout.Stack>
    </Fieldset>
{/if}
